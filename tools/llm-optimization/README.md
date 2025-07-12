# LLM Optimization

Utilities for benchmarking and optimizing the offline language model.

- `benchmark.ts` – measure tokens per second by sending requests to a running model endpoint.
- `optimize.sh` – generate quantized/pruned weights placed in `offline-model/optimized/`.

Run the benchmark while the offline model container is running:

```bash
ts-node tools/llm-optimization/benchmark.ts --url http://localhost:8001/generate
```

Optimize weights and rebuild the container:

```bash
tools/llm-optimization/optimize.sh offline-model/finetuned
docker build -f offline-model/Dockerfile -t offline-llm ./offline-model
```
