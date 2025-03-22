from flask import Flask, request, jsonify
import requests
import json

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')

    try:
        ollama_response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "gemma3:27b",
                "prompt": message,
                "stream": False  # This fixes the issue clearly!
            }
        )

        response_json = ollama_response.json()
        ai_response = response_json.get("response", "")

        return jsonify({"response": ai_response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
