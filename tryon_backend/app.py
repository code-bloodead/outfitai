import os
import requests
import time
import json
import cv2
import uvicorn
import ngrok
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import FastAPI, Request, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from gradio_client import Client as GradioClient, handle_file
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
import cloudinary
from cloudinary import CloudinaryImage
import cloudinary.uploader
import cloudinary.api

from imgUtil import gradio_result_to_base64_response

load_dotenv()

PORT = 5002
HF_TOKEN = os.getenv("HF_TOKEN")
NGROK_AUTHTOKEN = os.getenv("NGROK_AUTHTOKEN")
NGROK_DOMAIN=os.getenv("NGROK_DOMAIN")
NGROK_URL = f"https://{NGROK_DOMAIN}"

LOWER_FULL_BODY_HF_API = "levihsu/OOTDiffusion"
UPPER_HF_API = "yisol/IDM-VTON"
# UPPER_HF_API = "tuan2308/IDM-VTON"

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
twilioClient = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

use_sample_response = False
sample_images = [os.path.join("sample", "image.png")]

config = cloudinary.config(
    secure=True,
    cloud_name= os.getenv("CLOUDINARY_NAME"),
    api_key= os.getenv("CLOUDINARY_API_KEY"),
    api_secret= os.getenv("CLOUDINARY_API_SECRET"),  
)
print("****Set up and configure the SDK:****\nCredentials: ", config.cloud_name, config.api_key, "\n")


# ngrok free tier only allows one agent.
# So we tear down the tunnel on application termination
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Setting up Ngrok Tunnel")
    ngrok.set_auth_token(NGROK_AUTHTOKEN)
    ngrok.forward(
        addr=PORT,
        # labels=NGROK_EDGE,
        labels="edge:edghts_",
        proto="labeled",
    )
    print("Ngrok tunnel ready at", await ngrok.get_listeners())
    yield
    print("Tearing Down Ngrok Tunnel")
    ngrok.disconnect()

app = FastAPI()
# app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can adjust this based on your requirements
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")




def upload_image(file_path):
    try:
        upload_result = cloudinary.uploader.upload(file_path, resource_type="image", access_mode="public")
        print("Result", upload_result)
        public_url = upload_result.get("secure_url")
        return public_url

    except Exception as e:
        print(f"Error: {e}")
        return None

@app.get("/")
@app.get("/testapi")
async def TestAPI():
    return { "message": "Up and running !!" }


def upper_tryon_engine(person_img_url, cloth_img_url):
    if use_sample_response:
        return gradio_result_to_base64_response(sample_images)
        
    gradioClient = GradioClient(UPPER_HF_API, hf_token=HF_TOKEN)
    # gradioClient = GradioClient(UPPER_HF_API)

    result = gradioClient.predict(
            dict={"background":handle_file(person_img_url),"layers":[],"composite": None},
            garm_img=handle_file(cloth_img_url),
            garment_des="Hello!!",
            is_checked=True,
            is_checked_crop=False,
            denoise_steps=30,
            seed=42,
            api_name="/tryon"
    )
    print(result)
    print("Generated images", result)
    print("Generated images len", len(result))

    return gradio_result_to_base64_response(result)

def lower_and_full_tryon_engine(person_img_url, cloth_img_url, category):
    if use_sample_response:
        return gradio_result_to_base64_response(sample_images)
    
    gradioClient = GradioClient(LOWER_FULL_BODY_HF_API, hf_token=HF_TOKEN)
    # gradioClient = GradioClient(LOWER_FULL_BODY_HF_API)
    print("Setup gradio client over server", LOWER_FULL_BODY_HF_API, "for\n", category, person_img_url, cloth_img_url)

    result = gradioClient.predict(
            vton_img=handle_file(person_img_url),
            garm_img=handle_file(cloth_img_url),
            n_samples=1,
            n_steps=20,
            image_scale=2,
            seed=-1,
            api_name="/process_hd"
    )
    print("Generated specified images", category, result)
    result_imgs_srcs = [res_image['image'] for res_image in result]
    print("Generated specified image srcs", result_imgs_srcs)
    return gradio_result_to_base64_response(result_imgs_srcs)


class ImageInput(BaseModel):
    person_img_url: str
    cloth_img_url: str

@app.post("/tryUpperBodyOutfit")
async def TryUpperBodyOutfit(image_input: ImageInput):
    person_img_url = image_input.person_img_url
    cloth_img_url = image_input.cloth_img_url
    return upper_tryon_engine(person_img_url, cloth_img_url)


class ImageInputWithCategory(BaseModel):
    person_img_url: str
    cloth_img_url: str
    category: str
@app.post("/tryOutfit")
async def TrySpecifiedOutfit(image_input: ImageInputWithCategory):
    person_img_url = image_input.person_img_url
    cloth_img_url = image_input.cloth_img_url
    category = image_input.category

    if(category == "Upper-body"):
        return upper_tryon_engine(person_img_url, cloth_img_url)
    return lower_and_full_tryon_engine(person_img_url, cloth_img_url, category)
    


# In-memory storage for tracking sessions
user_sessions = {}

@app.post("/webhook")
async def webhook(request: Request):
    form_data = await request.form()
    sender_number = form_data.get('From')
    media_url = form_data.get('MediaUrl0')

    resp = MessagingResponse()

    print(f"Received message from {sender_number} with media URL: {media_url}")
    
    # if media_url is None:
    #     resp.message("We didn't receive an image. Please try sending your image again.")
    #     return HTMLResponse(str(resp))
    print(user_sessions[sender_number] if sender_number in user_sessions else f"No session found for {sender_number}")

    # Step 1: Check if person image is uploaded
    if sender_number not in user_sessions:
        if media_url:
            user_sessions[sender_number] = {}
            user_sessions[sender_number]['person_image'] = media_url
            resp.message("Great! Now please send the image of the garment you want to try on.")
        else:
            resp.message("Please send your image to begin the virtual try-on process.")
    elif 'person_image' in user_sessions[sender_number] and 'garment_image' not in user_sessions[sender_number]:
        if media_url:
            user_sessions[sender_number]['garment_image'] = media_url
            try_on_image_url = await send_to_gradio(user_sessions[sender_number]['person_image'], media_url)
            # try_on_image_url = upload_image("static/result.png")
            if try_on_image_url:
                await send_media_message(sender_number, try_on_image_url)
                resp.message("Here is your virtual try-on result!")
            else:
                resp.message("You've exceeded your GPU quota. Please try again later.")
            del user_sessions[sender_number]
        else:
            resp.message("Please send the garment image to complete the process.")
    else:
        resp.message("Please send your image to begin the virtual try-on process.")

    return HTMLResponse(str(resp))

async def send_to_gradio(person_image_url, garment_image_url):
    person_image_path = download_image(person_image_url, 'person_image.jpg')
    garment_image_path = download_image(garment_image_url, 'garment_image.jpg')

    if person_image_path is None or garment_image_path is None:
        return None
    print("Downloaded person and garment images from twilio")

    # return upload_image("static/result.png")

    try:
        result = upper_tryon_engine(person_image_path, garment_image_path)

        if result and len(result) > 0:
            return upload_image("static/result.png")
        return None

    except Exception as e:
        print(f"Error interacting with Gradio API: {e}")
        return None

async def send_media_message(to_number, media_url):
    print(f"Sending media message to {to_number} with URL: {media_url}....")
    message = twilioClient.messages.create(
        from_='whatsapp:+14155238886',
        body="Here is your virtual try-on result !!",
        media_url=[media_url],
        to=to_number
    )
    print(f"Sent media message to {to_number}. Message SID: {message.sid}")

def download_image(media_url, filename):
    try:
        message_sid = media_url.split('/')[-3]
        media_sid = media_url.split('/')[-1]

        media = twilioClient.api.accounts(TWILIO_ACCOUNT_SID).messages(message_sid).media(media_sid).fetch()
        media_uri = media.uri.replace('.json', '')
        image_url = f"https://api.twilio.com{media_uri}"

        response = requests.get(image_url, auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN))
        
        if response.status_code == 200:
            with open(filename, 'wb') as f:
                f.write(response.content)
            return filename
        return None
    except Exception as err:
        print(f"Error downloading image from Twilio: {err}")
        return None




# Sample inputs
person = "https://res.cloudinary.com/dp0ayty6p/image/upload/v1707754422/outfit_genai/samples/hrk.jpg"
cloth = "https://res.cloudinary.com/dp0ayty6p/image/upload/v1708500121/outfit_genai/samples/hoodie.png"

category = "Dress"
category = "Lower-body"
category = "Upper-body"


# def testit():
#   response = TryUpperBodyOutfit(person, cloth)
#   response = TrySpecifiedOutfit(person, cloth, category)
#   print("Responses")
#   for i in response:
#     print(i['image'])


print("Server is ready to serve using hosted space")

if __name__ == "__main__":
    print("Starting server at", PORT)

    uvicorn.run(app, port=PORT, reload=True)
    # uvicorn.run(app, port=PORT, reload=True, lifespan=lifespan)

# Ref
# https://huggingface.co/spaces/levihsu/OOTDiffusion
# https://ootd.ibot.cn/
