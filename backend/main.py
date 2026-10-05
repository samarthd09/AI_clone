from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-3.8-flash')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Prompt(BaseModel):
    text : str

  

@app.get('/home')
def home():
    return {'messege':'FastAPI Server is Running'}

@app.post('/send-prompt')
def send_prompt(prompt: Prompt):
    response = model.generate_content(prompt.text)
    return {
        'response' : response.text
    }