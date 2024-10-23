<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="https://github.com/user-attachments/assets/6af9879b-e975-4be1-8e17-f5c91f92d984" alt="Logo" height="80" />
  </a>


  <h3 align="center">Outfit.ai - GenAI powered e-commerce </h3>

  <div align="center">
      Fashion store with personalized try-ons, a gen AI assistant and trend-based recommendations.
     <br/>
    <h3>
    <a href="https://youtu.be/rGxVOGcAbcI" target='_blank'>View Video Demo 📽️</a>
    </h3>
  </div>
</div>

Tech stack - Langchain, Fast API, ChromaDB, NodeJS, React, MongoDB, Automatic1111

- Engaging conversational chatbot with guardrails powered by Llama2 13B leveraging Langchain RAG pipelines
- Personalised outfit try-on experience using Stable diffusion in-painting over user’s images
- Collaborative & content-based recommendations using trending knowledge-base scraped from fashion magazines

## Setup


```

# Install dependencies
npm run setup

# Run Backend server
nodemon backend/server.js

# Run frontend
cd frontend && npm start

# Tryon demo (API proxy for Huggingface spaces)
cd tryon_backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port=5000

```
