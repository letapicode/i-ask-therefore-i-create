# Project Tasks

The following tasks are organized by category to cover the full implementation described in `implementation_plan.md`. Each task references a specific folder or module to minimize merge conflicts.

## 1. Workspace Setup
1. Configure Turborepo/Nx in `turbo.json` and add build/lint scripts to `package.json`.
2. Ensure `pnpm-workspace.yaml` includes all `apps/`, `packages/`, and `services/` directories.
3. Provide global ESLint/Prettier configuration under `tools/` for consistent style.

## 2. Core Infrastructure (`/infrastructure`)
1. Create Terraform modules in `infrastructure/vpc` for networking (VPC, subnets, security groups).
2. Add IAM role and policy templates in `infrastructure/terraform`.
3. Configure AWS Cognito user pool setup in `infrastructure/cognito`.
4. Add SES configuration and placeholder email templates in `infrastructure/ses`.
5. Set up observability stack (CloudWatch, X-Ray) in `infrastructure/observability`.

## 3. Authentication Service (`/apps/api-auth`)
1. Implement REST API endpoints for signup and login with JWT tokens.
2. Add password hashing (bcrypt) and a simple user model (e.g. DynamoDB table or PostgreSQL schema).
3. Implement email verification endpoint that calls `/services/email`.
4. Write unit tests for auth routes.

## 4. Orchestrator Service (`/apps/orchestrator`)
1. Create API endpoint to accept app descriptions and create build jobs.
2. Store job status in a database table (DynamoDB).
3. Trigger `/apps/codegen` via messaging (e.g. SQS) and handle completion callbacks.
4. Expose status query endpoints for the portal.

## 5. Code Generation Service (`/apps/codegen`)
1. Connect to the OpenAI API and generate basic project scaffolds.
2. Run generated code through tests/linters before publishing artifacts.
3. Package artifacts for deployment (Docker image or zipped source).
4. Allow configurable prompt templates from `/packages/codegen-templates`.

## 6. Frontend Portal (`/apps/portal`)
1. Build login and signup pages that call the Auth API.
2. Add form to submit app descriptions to the Orchestrator.
3. Implement dashboard listing user apps with status updates.
4. Provide page to view logs and trigger rebuilds.

## 7. Shared Libraries (`/packages/shared`)
1. Create reusable authentication utilities (JWT helpers, password hashing wrappers).
2. Add AWS SDK wrappers (S3 uploads, SES send, Cognito helpers).
3. Export a logging helper used across services.

## 8. Codegen Templates (`/packages/codegen-templates`)
1. Add prompt templates for CRUD REST APIs and basic React UIs.
2. Provide template snippets for auth flows and database setup.
3. Document how to extend templates for new features.

## 9. Supporting Services
### Analytics Service (`/services/analytics`)
1. Implement endpoint to ingest events from generated apps.
2. Store metrics in a time‑series DB and expose summaries via API.

### Email Service (`/services/email`)
1. Wrap AWS SES send API with retry logic.
2. Expose functions for verification and build‑status emails.

## 10. CI/CD (`/ci`)
1. Create GitHub Actions workflow to lint and test all packages.
2. Add deployment workflow that provisions infrastructure and deploys services on merge.

## 11. Observability
1. Configure centralized logging and metrics dashboards under `infrastructure/observability`.
2. Integrate basic error tracking (Sentry or similar) in backend and frontend apps.

## 12. Example Generated App (`/apps/user-app-temp`)
1. Provide a simple template project used for testing code generation output.
2. Include instructions in `README` on how the template is generated and deployed.

## 13. Documentation
1. Expand `README.md` with instructions for local development and deployment.
2. Document test commands and update `AGENTS.md` once tests exist.

