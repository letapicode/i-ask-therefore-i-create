# i-ask-therefore-i-create
Describe your idea. We generate the code, deploy it, and scale it—automatically.

This repository uses a monorepo structure as outlined in `implementation_plan.md`.
The folders are currently scaffolds that will contain the platform services.

## New Modules

- `infrastructure/vpc` - Terraform VPC module.
- `infrastructure/artifacts` - S3 artifact storage module.
- `packages/retry` - reusable retry utility for async tasks.
