import os
import requests
import time
import json
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

config = cloudinary.config(secure=True)
print("****1. Set up and configure the SDK:****\nCredentials: ", config.cloud_name, config.api_key, "\n")
