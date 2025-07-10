# Offline LLM Container

This guide explains how to run the local language model used by the codegen service when network access is not available.

## Hardware Requirements

- 8 GB RAM minimum
- 10 GB of free disk space
- CPU with AVX support (GPU optional for fine-tuning)

## Usage

1. Build the container:

```bash
docker build -f offline-model/Dockerfile -t offline-llm .
```

2. Start the container:

```bash
docker run -p 8001:8000 offline-llm
```

3. Set `CUSTOM_MODEL_URL=http://localhost:8001/generate` and start the codegen service or run `tools/offline.sh` which configures it automatically.

### Fine-tuning

Provide a text file of training data and run:

```bash
tools/fine-tune-local.sh data/train.txt
```

New weights are written under `offline-model/finetuned/`.
