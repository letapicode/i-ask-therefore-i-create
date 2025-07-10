FROM python:3.10-slim
WORKDIR /app
COPY serve.py ./serve.py
COPY fine_tune.py ./fine_tune.py
COPY infer.py ./infer.py
RUN pip install --no-cache-dir torch==2.1.0 transformers==4.36.2 flask
RUN python - <<'PY'
from transformers import AutoModelForCausalLM, AutoTokenizer
model = 'distilgpt2'
AutoModelForCausalLM.from_pretrained(model).save_pretrained('/model')
AutoTokenizer.from_pretrained(model).save_pretrained('/model')
PY
EXPOSE 8000
CMD ["python","serve.py","--model","/model"]
