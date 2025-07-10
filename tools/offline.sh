#!/bin/sh
# Start dependencies and run all services locally for offline generation

docker-compose up -d
docker build -f offline-model/Dockerfile -t offline-llm ./offline-model
docker run -d --rm -p 8001:8000 --name offline-llm offline-llm
export CUSTOM_MODEL_URL=http://localhost:8001/generate
pnpm --filter services/email start &
pnpm --filter services/analytics start &
pnpm --filter apps/api-auth start &
pnpm --filter apps/orchestrator start &
pnpm --filter apps/codegen start &
wait
