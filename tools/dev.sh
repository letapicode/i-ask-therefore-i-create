#!/bin/sh
# Start core services for local development
node services/analytics/src/index.ts &
node services/email/src/index.ts &
node apps/api-auth/src/index.ts &
wait
