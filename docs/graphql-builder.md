# GraphQL API Builder

The code generation service can translate data models into a GraphQL schema automatically. Generated resolvers use the shared database layer for storage.

## Customizing the Schema

Edit `schema.json` via the schema designer or voice modeling tools. During app
creation the orchestrator converts this file using `generateSchema` and includes
the result as `schema.graphql` in the generated template. Marketplace templates
may register hooks via `registerTemplate` to transform the schema before code
generation.
