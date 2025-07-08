import { WebSocketServer, WebSocket } from 'ws';
import fetch from 'node-fetch';
import { initSentry } from '../../packages/shared/src/sentry';
import { logAudit } from '../../packages/shared/src/audit';

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3002';

export function start(port = 4001) {
  initSentry('collab-workflow');
  const wss = new WebSocketServer({ port });
  wss.on('connection', async (ws) => {
    logAudit('collab-workflow connection');
    try {
      const res = await fetch(`${ORCHESTRATOR_URL}/api/workflow`);
      const data = await res.json();
      ws.send(JSON.stringify({ type: 'init', data }));
    } catch (err) {
      console.error('init fetch failed', err);
    }
    ws.on('message', async (msg) => {
      try {
        const { type, data } = JSON.parse(msg.toString());
        if (type === 'update') {
          for (const client of wss.clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'update', data }));
            }
          }
          try {
            await fetch(`${ORCHESTRATOR_URL}/api/workflow`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
          } catch (err) {
            console.error('persist failed', err);
          }
        }
      } catch {}
    });
  });
  console.log(`collab-workflow listening on ${port}`);
  return wss;
}

if (require.main === module) {
  start(Number(process.env.PORT) || 4001);
}
