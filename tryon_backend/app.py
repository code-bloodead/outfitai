from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
from typing import List
from gradio_client import Client
from imgUtil import gradio_result_to_base64_response
from fastapi.middleware.cors import CORSMiddleware
import time
import sys


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can adjust this based on your requirements
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

use_sample_response = False

upperbody_sample_response_file = "sample_response.json"
specified_sample_response_file = "sample_response.json"

# gradio_hosted_url = "https://ootd.ibot.cn/"
# gradio_hosted_url = "https://levihsu-ootdiffusion.hf.space/--replicas/eldt3/"
gradio_hosted_url = "https://levihsu-ootdiffusion.hf.space"


class ImageInput(BaseModel):
    person_img_url: str
    cloth_img_url: str

def get_sample_response():
    with open(upperbody_sample_response_file, 'r') as f:
        result = json.load(f)
    time.sleep(2)
    return result

@app.post("/tryUpperBodyOutfit")
async def TryUpperBodyOutfit(image_input: ImageInput):
    if use_sample_response:
      return get_sample_response()

    person_img_url = image_input.person_img_url
    cloth_img_url = image_input.cloth_img_url

    gradio_client = Client(
        gradio_hosted_url, download_files=True, ssl_verify=False)
    print("Setup gradio client over server", gradio_hosted_url)

    # person_img_blob = gradio_client.file(person_img_url),
    # cloth_img_blob = gradio_client.file(cloth_img_url),
    result = gradio_client.predict(
        person_img_url,
        cloth_img_url,
        1,  # float (numeric value between 1 and 4) in 'Images' Slider component
        # float (numeric value between 20 and 40) in 'Steps' Slider component
        20,
        # float (numeric value between 1.0 and 5.0) in 'Guidance scale' Slider component
        1,
        # float (numeric value between -1 and 2147483647) in 'Seed' Slider component
        -1,
        api_name="/process_hd"
    )
    print("Generated upper body images", result)
    return gradio_result_to_base64_response(result)


class ImageInputWithCategory(BaseModel):
    person_img_url: str
    cloth_img_url: str
    category: str


@app.post("/tryOutfit")
async def TrySpecifiedOutfit(image_input: ImageInputWithCategory):
    if use_sample_response:
      return get_sample_response()

    person_img_url = image_input.person_img_url
    cloth_img_url = image_input.cloth_img_url
    category = image_input.category

    gradio_client = Client(
        gradio_hosted_url, download_files=True, ssl_verify=False)
    print("Setup gradio client over server", gradio_hosted_url, "for\n", category, person_img_url, cloth_img_url)
    # person_img_blob = gradio_client.file(person_img_url),
    # cloth_img_blob = gradio_client.file(cloth_img_url),
    result = gradio_client.predict(
        person_img_url,
        cloth_img_url,
        # Literal['Upper-body', 'Lower-body', 'Dress']  in 'Garment category (important option!!!)' Dropdown component
        category,
        1,  # float (numeric value between 1 and 6) in 'Images' Slider component
        # float (numeric value between 20 and 40) in 'Steps' Slider component
        20,
        # float (numeric value between 1.0 and 5.0) in 'Guidance scale' Slider component
        1,
        # float (numeric value between -1 and 2147483647) in 'Seed' Slider component
        -1,
        api_name="/process_dc"
    )
    print("Generated specified images", category, result)
    return gradio_result_to_base64_response(result)


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

print("Server is ready to serve using hosted space", gradio_hosted_url)    
print("Use sample response", use_sample_response)


if __name__ == "__main__":
    # get args
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)



# Ref
# https://huggingface.co/spaces/levihsu/OOTDiffusion
# https://ootd.ibot.cn/
