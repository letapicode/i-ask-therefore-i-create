# Offline Generation Mode

This guide explains how to run the entire pipeline without any external services. It is useful for testing in restricted environments.

1. Run `tools/offline.sh`. This script starts DynamoDB and LocalStack via `docker-compose` and then launches all services using `pnpm`.
2. Open the portal at `http://localhost:3000` and create an app as usual. All APIs point to the local instances.
3. Generated artifacts are written to the local `binary-assets/` directory.

```bash
./tools/offline.sh
```

Use `CTRL+C` to stop all running services.
