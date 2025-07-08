import WebSocket from 'ws';
import { start } from './index';

test('broadcasts workflow updates', (done) => {
  const wss = start(0);
  const { port } = wss.address() as any;
  const a = new WebSocket(`ws://localhost:${port}`);
  const b = new WebSocket(`ws://localhost:${port}`);

  b.on('message', (msg) => {
    const { type, data } = JSON.parse(msg.toString());
    if (type === 'update' && data.test === true) {
      wss.close();
      done();
    }
  });

  b.on('open', () => {
    a.on('open', () => {
      a.send(JSON.stringify({ type: 'update', data: { test: true } }));
    });
  });
});
