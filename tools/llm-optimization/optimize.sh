#!/bin/sh
# Quantize and prune offline LLM weights

SRC=${1:-offline-model/model}
DEST=offline-model/optimized
mkdir -p "$DEST"
python - <<'PY'
import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
src = os.environ['SRC']
dest = os.environ['DEST']
model = AutoModelForCausalLM.from_pretrained(src)
model = torch.quantization.quantize_dynamic(model, {torch.nn.Linear}, dtype=torch.qint8)
model.save_pretrained(dest)
AutoTokenizer.from_pretrained(src).save_pretrained(dest)
PY

echo "Optimized weights saved to $DEST"
