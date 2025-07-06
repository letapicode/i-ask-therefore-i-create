#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const WebSocket = require('ws');

const program = new Command();
program
  .description('Edit app descriptions collaboratively over WebSockets')
  .option('-s, --server <url>', 'websocket server url', 'ws://localhost:4000')
  .option('-f, --file <path>', 'description file', 'description.md')
  .parse(process.argv);

const opts = program.opts();
const ws = new WebSocket(opts.server);

ws.on('open', () => {
  console.log('connected to', opts.server);
  if (fs.existsSync(opts.file)) {
    const data = fs.readFileSync(opts.file, 'utf8');
    ws.send(JSON.stringify({ type: 'init', data }));
  }
});

ws.on('message', (msg) => {
  try {
    const { type, data } = JSON.parse(msg);
    if (type === 'update') {
      fs.writeFileSync(opts.file, data, 'utf8');
      console.log('remote update written');
    }
  } catch {}
});

fs.watch(opts.file, { encoding: 'utf8' }, (evt, filename) => {
  if (evt === 'change') {
    const data = fs.readFileSync(opts.file, 'utf8');
    ws.send(JSON.stringify({ type: 'update', data }));
  }
});
