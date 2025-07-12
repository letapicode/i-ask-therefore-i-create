# Offline LLM Optimization

This guide explains how to benchmark and optimize the containerized language model used when the platform runs in offline mode.

## Benchmarking

Start the offline model container using `tools/offline.sh` or run it manually. Then execute the benchmark script:

```bash
ts-node tools/llm-optimization/benchmark.ts --url http://localhost:8001/generate
```

The script issues several requests and prints the number of tokens processed per second.

## Optimization

After fine-tuning a model you can apply quantization and pruning to improve inference speed:

```bash
tools/llm-optimization/optimize.sh offline-model/finetuned
```

Optimized weights are written to `offline-model/optimized/`. Rebuild the Docker image so the new weights are bundled:

```bash
docker build -f offline-model/Dockerfile -t offline-llm ./offline-model
```

Restart the container to serve the optimized model.
