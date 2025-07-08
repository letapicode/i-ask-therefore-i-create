import { WebSocketServer, WebSocket } from 'ws';

const DEFAULT_PORT = Number(process.env.PORT || 4000);

let wss: WebSocketServer | undefined;
let content = '';
const cursors = new Map<string, number>();

function broadcast(data: any) {
  if (!wss) return;
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

function broadcastCursors() {
  broadcast({ type: 'cursors', data: Object.fromEntries(cursors) });
}

function setup(server: WebSocketServer) {
  server.on('connection', (ws) => {
    let userId = `user-${Math.random().toString(36).slice(2, 8)}`;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        switch (msg.type) {
          case 'join':
            userId = msg.userId || userId;
            cursors.set(userId, 0);
            broadcastCursors();
            break;
          case 'init':
            content = msg.data;
            broadcast({ type: 'update', data: content });
            break;
          case 'update':
            content = msg.data;
            if (typeof msg.cursor === 'number') {
              cursors.set(userId, msg.cursor);
              broadcastCursors();
            }
            broadcast({ type: 'update', data: content });
            break;
          case 'cursor':
            cursors.set(userId, msg.cursor);
            broadcastCursors();
            break;
        }
      } catch {
        // ignore parse errors
      }
    });

    ws.on('close', () => {
      cursors.delete(userId);
      broadcastCursors();
    });

    ws.send(
      JSON.stringify({
        type: 'init',
        data: content,
        cursors: Object.fromEntries(cursors),
      })
    );
  });
}

export function start(port = DEFAULT_PORT) {
  wss = new WebSocketServer({ port });
  setup(wss);
  console.log(`collab service listening on ${port}`);
}

if (require.main === module) {
  start();
}
