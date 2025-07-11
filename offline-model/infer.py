import argparse
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

parser = argparse.ArgumentParser()
parser.add_argument('--model', required=True)
parser.add_argument('--prompt', required=True)
parser.add_argument('--lang')
args = parser.parse_args()

model = AutoModelForCausalLM.from_pretrained(args.model)
tokenizer = AutoTokenizer.from_pretrained(args.model)
pipe = pipeline('text-generation', model=model, tokenizer=tokenizer)
res = pipe(args.prompt, max_new_tokens=200)
print(res[0]['generated_text'])
