# Collaborative Workflow Service

WebSocket server that broadcasts workflow builder updates to all connected clients and
persists changes via the orchestrator.

## Usage

Set `ORCHESTRATOR_URL` to point to the orchestrator API. Run with `node dist/index.js` after building.

Clients should send messages of the form `{ type: 'update', data: <workflow> }`.
On connection, the server sends the current workflow using `{ type: 'init', data }`.
