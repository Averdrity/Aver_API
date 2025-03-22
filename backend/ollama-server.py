# ========================================
# 🐍 ollama-server.py (v3.0)
# ========================================
# Flask app to interface with Ollama AI.
# Handles chat requests, error logging,
# and input validation.
# ========================================

from flask import Flask, request, jsonify
import logging
import time
import os
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables (e.g., from .env file)
load_dotenv()

# Configuration
LOG_FILE = os.getenv("LOG_FILE", "../logs/python.log")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
OLLAMA_MODEL_URL = os.getenv("OLLAMA_MODEL_URL", "http://localhost:11434/api/generate") # Default Ollama API endpoint

# Configure logging
logging.basicConfig(
    filename=LOG_FILE,
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format='{"time":"%(asctime)s", "level":"%(levelname)s", "module":"%(module)s", "message":"%(message)s"}'
)

def sanitize_input(text):
    """
    Basic input sanitization to prevent potential issues.
    More robust sanitization might be needed depending on the context.
    """
    if not isinstance(text, str):
        return ""
    return text.replace("<", "&lt;").replace(">", "&gt;")

def call_ollama_model(user_msg):
    """
    Calls the Ollama model API (or local inference).
    Replace the stub response with actual Ollama interaction.
    """
    try:
        # TODO: Replace this with actual Ollama API call using requests or similar
        # Example using requests (install with: pip install requests):
        # import requests
        # response = requests.post(OLLAMA_MODEL_URL, json={"prompt": user_msg})
        # response.raise_for_status()  # Raise an exception for bad status codes
        # ollama_reply = response.json()["response"]
        time.sleep(1.5)  # Simulate thinking delay
        ollama_reply = f"Echo from Ollama AI: {user_msg}"  # Stub response
        return ollama_reply
    except Exception as e:
        logging.error(f"Ollama call error: {str(e)}")
        return None

@app.route('/chat', methods=['POST'])
def chat():
    """
    Handles chat requests, validates input, calls the Ollama model,
    and returns the response.
    """
    try:
        data = request.get_json()
        if not data or "message" not in data:
            logging.warning("Invalid request format")
            return jsonify({"error": "Invalid request format"}), 400

        user_msg = sanitize_input(data["message"].strip())

        if not user_msg:
            logging.warning("Empty input received")
            return jsonify({"error": "Empty input"}), 400

        reply = call_ollama_model(user_msg)

        if reply is None:
            return jsonify({"error": "AI model error"}), 500

        return jsonify({"reply": reply})

    except Exception as e:
        logging.exception("Chat handler error")  # Use logging.exception to get the traceback
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) # Enable debug mode during development
