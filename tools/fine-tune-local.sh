#!/bin/sh
# Fine-tune the offline LLM on a text corpus

if [ -z "$1" ]; then
  echo "Usage: $0 <training-file>"
  exit 1
fi
MODEL=${LOCAL_MODEL_PATH:-offline-model/model}
python offline-model/fine_tune.py --model "$MODEL" --data "$1" --output offline-model/finetuned
