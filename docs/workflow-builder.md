# Visual Workflow Builder

The portal now uses React Flow to visually arrange workflow nodes. Configurations are loaded from `/api/workflow` and saved back to that endpoint. Example JSON:

```json
{
  "nodes": [{ "id": "1", "type": "start", "position": { "x": 0, "y": 0 } }]
}
```

## Real-time collaboration

The optional `collab-workflow-service` broadcasts updates over WebSockets so multiple
users can edit the same workflow simultaneously. Clients automatically reconnect
and receive the latest state. If the connection drops, edits continue using the
REST endpoint and resync once reconnected.
