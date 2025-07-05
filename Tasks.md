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

## Repository Setup
42. Configure workspace-wide build, test and lint scripts in the root `package.json`.
43. Add `.env.example` files to each app directory documenting required variables.

## Additional Infrastructure
44. Create Terraform modules for S3 and CloudFront in `infrastructure/static-site`.
45. Add PostgreSQL templates in `infrastructure/db` with encryption settings.
46. Manage secrets via AWS SSM Parameter Store.

## Extended Backend Services
### Authentication Service (`apps/api-auth`)
47. Implement password reset and email change endpoints.
48. Add Google OAuth login support.

### Orchestrator (`apps/orchestrator`)
49. Expose `/api/status` endpoint to return job progress.
50. Implement retry logic for failed CodeGen tasks.
51. Store build artifacts in S3 for later download.

### Code Generation Service (`apps/codegen`)
52. Cache generated templates to speed up repeated builds.
53. Enforce linting and formatting with ESLint and Prettier.

### Email Service (`services/email`)
54. Provide SES templates for verification and build notifications.

### Analytics Service (`services/analytics`)
55. Define DynamoDB schema for event logs.
56. Expose aggregated metrics API.

## Frontend Portal Enhancements (`apps/portal`)
57. Add account settings page for updating user information.
58. Implement analytics dashboard with charts.
59. Display build logs and generation history.

## Example App Template (`apps/user-app-temp`)
60. Populate with a basic Todo app demonstrating generated features.

## Shared Packages Extensions
61. Add DynamoDB helper utilities in `packages/shared`.
62. Create a CLI in `packages/codegen-templates` to list available modules.

## CI/CD and DevOps Additions
63. Create a release workflow under `ci/` to publish packages on tag.
64. Configure Nx Cloud remote caching for faster builds.

## Observability Improvements
65. Define log retention and alarm policies in `infrastructure/observability`.
66. Integrate Sentry DSNs via environment variables.

## Testing & Security Expansion
67. Add Cypress tests for portal user flows.
68. Include OWASP dependency checks in CI.

## Documentation Updates
69. Document infrastructure deployment steps in `infrastructure/README.md`.

## Tools and Utilities
70. Add scripts in `tools/` to bootstrap new service folders.

## Performance & Scaling
71. Add k6 load testing scripts under `tools/loadtest`.
72. Implement tenant isolation checks in the orchestrator.

## Compliance
73. Document GDPR data export and deletion processes.

## Local Development
74. Provide a `docker-compose.yml` for local stacks.

## Repository Governance
75. Add a `CODEOWNERS` file defining maintainers for each folder.

## Innovative Features

### Initial Phase
76. **Voice Input for Descriptions** – add speech-to-text in the portal so users can create app descriptions verbally.
77. **Collaborative Editor** – implement real-time editing of descriptions via WebSockets to support multiple users.
78. **Figma Design Import** – allow uploading Figma design JSON to generate matching UI components.

### Medium Phase
79. **Plugin Architecture** – support third-party feature modules (e.g., payments, chat) via a standard plugin interface.
80. **Self-Healing Deployments** – monitor orchestrator tasks and automatically restart failed jobs for reliability.
81. **AI-Based Test Generation** – use an LLM to create unit and integration tests from generated code.

### Advanced Phase
82. **Recommendation Engine** – analyze analytics to suggest feature improvements for users' apps.
83. **Data Connector Templates** – provide connectors for common APIs (Stripe, Slack) that can be added on demand.
84. **Edge Inference Support** – enable lightweight models to run in user browsers for offline predictions.
85. **A/B Testing Toolkit** – add utilities to define experiments and collect metrics in generated apps.
