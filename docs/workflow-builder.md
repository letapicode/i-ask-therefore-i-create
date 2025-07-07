# Visual Workflow Builder

The portal now uses React Flow to visually arrange workflow nodes. Configurations are loaded from `/api/workflow` and saved back to that endpoint. Example JSON:

```json
{
  "nodes": [{ "id": "1", "type": "start", "position": { "x": 0, "y": 0 } }]
}
```
