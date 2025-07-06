#!/bin/sh
# Start dependencies and run all services locally for offline generation

docker-compose up -d
pnpm --filter services/email start &
pnpm --filter services/analytics start &
pnpm --filter apps/api-auth start &
pnpm --filter apps/orchestrator start &
pnpm --filter apps/codegen start &
wait
