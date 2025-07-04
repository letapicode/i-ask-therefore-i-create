# Development Tasks

This file lists actionable tasks derived from `implementation_plan.md` and the existing codebase. Tasks are grouped by category so work can proceed in parallel without merge conflicts. Each item references the directory it touches.

## Infrastructure
1. **VPC & Networking** – create Terraform modules in `infrastructure/vpc` for VPC, subnets and security groups.
2. **IAM Roles** – define service roles and policies under `infrastructure`.
3. **Cognito Setup** – provision a user pool in `infrastructure/cognito`.
4. **SES Configuration** – add email domain and templates in `infrastructure/ses`.
5. **Observability Stack** – configure CloudWatch/X-Ray in `infrastructure/observability`.
6. **Terraform/CDK Scaffolding** – add base deploy scripts in `infrastructure/terraform`.

## Backend Services
### Authentication Service (`apps/api-auth`)
7. Implement signup and login endpoints with password hashing.
8. Manage JWT sessions and token refresh logic.
9. Connect to the user data store (Cognito or RDS).
10. Add email verification endpoint.

### Orchestrator (`apps/orchestrator`)
11. Create `/api/createApp` endpoint to accept app descriptions.
12. Parse input and dispatch CodeGen jobs.
13. Persist job status in DynamoDB.
14. Trigger deployments on completion.
15. Send notification emails via the email service.

### Code Generation Service (`apps/codegen`)
16. Integrate with the OpenAI API or local LLM.
17. Run generation tasks in isolated containers.
18. Execute tests (lint/unit) on generated code.
19. Publish build artifacts and commit to a repo.

### Email Service (`services/email`)
20. Wrap AWS SES to send templated emails.
21. Expose functions for other services to call.

### Analytics Service (`services/analytics`)
22. Collect usage events and store metrics.
23. Provide an API for portal dashboards.

## Frontend Portal (`apps/portal`)
24. Build login/signup pages integrated with the auth service.
25. Implement the "Create New App" wizard.
26. Show build status with polling of the orchestrator.
27. List user apps with links to logs and metrics.
28. Allow editing descriptions to trigger redeploys.

## Shared Packages
29. Develop `packages/shared` with logging utilities and AWS wrappers.
30. Add feature templates in `packages/codegen-templates` (auth flow, CRUD, chat AI).

## CI/CD and DevOps
31. Configure Turborepo/Nx tasks in `turbo.json`.
32. Add GitHub Actions workflows under `ci/` for linting, tests and deployments.
33. Enable remote caching to speed builds.

## Observability
34. Set up CloudWatch dashboards and X-Ray tracing.
35. Integrate optional Sentry error tracking.

## Testing & Security
36. Add unit tests for each service in their `src` folders.
37. Implement end-to-end tests simulating a user creating an app.
38. Configure CodeQL or similar static analysis.

## Documentation
39. Expand README files with setup and usage instructions.
40. Produce user guides and architecture diagrams.

## Tools
41. Add helper scripts in `tools/` for local development and deployment.
