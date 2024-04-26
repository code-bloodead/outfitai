## Conversational Fashion Outfit Generator powered by GenAI.


## Setup


```

# Run frontend & Backend
npm run setup
npm run dev


# Tryon demo (API proxy for Huggingface spaces)
cd tryon_backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port=5000

```