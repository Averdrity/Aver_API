# ===========================================
# 🤖 ollama-server.py (v3.0)
# ===========================================
# Flask backend integrating Ollama AI model
# ===========================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3:27b"  # Adjust your model here

@app.route("/", methods=["POST"])
def generate_ai_response():
    data = request.json
    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({"response": "Prompt is required."}), 400

    ollama_payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_API, json=ollama_payload, timeout=60)
        response.raise_for_status()

        ai_response = response.json().get("response", "")
        if not ai_response:
            return jsonify({"response": "AI response was empty."}), 500

        return jsonify({"response": ai_response})

    except requests.RequestException as e:
        app.logger.error(f"AI generation error: {e}")
        return jsonify({"response": "Failed to communicate with AI model."}), 500

@app.route("/", methods=["GET"])
def model_status():
    try:
        requests.get("http://localhost:11434/", timeout=5)
        return jsonify({"status": "running", "model": MODEL_NAME}), 200
    except requests.RequestException:
        return jsonify({"status": "offline"}), 503

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
