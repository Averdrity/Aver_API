# File: /backend/ollama-server.py

from flask import Flask, request, jsonify
import logging
import time

app = Flask(__name__)

# Configure logging
logging.basicConfig(
    filename='../logs/python.log',
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
)

# Assume Ollama Model API or local inference
# Stub response — replace this with actual Ollama inference call
def get_ai_response(user_msg):
    # TODO: Replace this with real model output
    time.sleep(1.5)  # Simulate thinking delay
    return f"Echo from Ollama AI: {user_msg}"

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_msg = data.get("message", "").strip()

        if not user_msg:
            return jsonify({"reply": "[Empty input]"}), 400

        reply = get_ai_response(user_msg)
        return jsonify({"reply": reply})

    except Exception as e:
        logging.error(f"Chat handler error: {str(e)}")
        return jsonify({"reply": "[Internal error]", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

