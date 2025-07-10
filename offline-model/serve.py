from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--model', required=True)
parser.add_argument('--host', default='0.0.0.0')
parser.add_argument('--port', type=int, default=8000)
args = parser.parse_args()

app = Flask(__name__)

model = AutoModelForCausalLM.from_pretrained(args.model)
tokenizer = AutoTokenizer.from_pretrained(args.model)
pipe = pipeline('text-generation', model=model, tokenizer=tokenizer)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json or {}
    prompt = data.get('prompt', '')
    lang = data.get('language', '')
    result = pipe(prompt, max_new_tokens=200)
    return jsonify(result=result[0]['generated_text'])

if __name__ == '__main__':
    app.run(host=args.host, port=args.port)
