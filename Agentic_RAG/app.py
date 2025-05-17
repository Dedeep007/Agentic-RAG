from flask import Flask, request, jsonify
from flask_cors import CORS
from LLM_RAG import LLM_RAG

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    api_key = data.get('api_key')
    prompt = data.get('prompt')
    worker_agents = data.get('worker_agents', 1)
    decision_loops = data.get('decision_loops', 1)
    rag = LLM_RAG(api_key=api_key, worker_agents=worker_agents, max_loops=decision_loops)
    response = rag.generate(prompt)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(port=5000)