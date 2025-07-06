# i-ask-therefore-i-create
Describe your idea. We generate the code, deploy it, and scale it—automatically.

This repository uses a monorepo structure as outlined in `implementation_plan.md`.
The folders are currently scaffolds that will contain the platform services.

## New Modules

- `infrastructure/vpc` - Terraform VPC module.
- `infrastructure/artifacts` - S3 artifact storage module.
- `infrastructure/iam` - IAM role definitions.
- `infrastructure/cognito` - User pool provisioning.
- `infrastructure/ses` - Email domain and templates.
- `infrastructure/observability` - CloudWatch and X-Ray setup.
- `infrastructure/terraform` - Example stack wiring modules together.
- `packages/retry` - Reusable retry utility for async tasks.
- `packages/shared` - AWS helpers including DynamoDB utilities.
- `packages/codegen-templates` - Template library with a CLI.
- `services/email` - SES wrapper for sending templated emails.
- `services/analytics` - Basic event collection API.

