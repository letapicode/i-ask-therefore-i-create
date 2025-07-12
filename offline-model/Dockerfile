FROM python:3.10-slim
WORKDIR /app
COPY serve.py ./serve.py
COPY fine_tune.py ./fine_tune.py
COPY infer.py ./infer.py
# Optional optimized weights are placed under offline-model/optimized
COPY optimized/ /opt/weights
RUN pip install --no-cache-dir torch==2.1.0 transformers==4.36.2 flask
# Use optimized weights when available otherwise download a small default model
RUN python - <<'PY'
import os
from transformers import AutoModelForCausalLM, AutoTokenizer

path = '/opt/weights'
if os.path.exists(path) and os.listdir(path):
    model_path = path
else:
    model_path = 'distilgpt2'

AutoModelForCausalLM.from_pretrained(model_path).save_pretrained('/model')
AutoTokenizer.from_pretrained(model_path).save_pretrained('/model')
PY
EXPOSE 8000
CMD ["python", "serve.py", "--model", "/model"]
