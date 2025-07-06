# System Architecture

The platform consists of microservices for authentication, orchestration, code generation, email and analytics. Each service is deployed independently and communicates via HTTP APIs.

```
[Portal] -> [Orchestrator] -> [Codegen]
                     |-> [Email]
                     |-> [Analytics]
```

Infrastructure is provisioned using Terraform modules under the `infrastructure/` directory.
