# Graph Databases

The graph database template uses Neo4j by default and can be adapted for Amazon Neptune. Sample schema and CRUD routes are located under `packages/codegen-templates/src/templates/graph-db`.

## Deployment

1. Provision a Neo4j or Neptune instance and note the connection URL.
2. Set `NEO4J_URL`, `NEO4J_USER` and `NEO4J_PASS` when running `server.ts`.
3. For Neptune, adjust the connector to use `createNeptuneConnector` with the service endpoint.

Graph databases are ideal for highly connected data but may require extra memory and compute resources.
