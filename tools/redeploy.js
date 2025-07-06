#!/usr/bin/env node
const { Command } = require('commander');
const fetch = require('node-fetch');

const program = new Command();
program
  .requiredOption('-i, --id <id>', 'existing job id')
  .requiredOption('-d, --description <desc>', 'new description')
  .option('-u, --url <url>', 'orchestrator url', 'http://localhost:3002');

program.parse(process.argv);
const opts = program.opts();

(async () => {
  const res = await fetch(`${opts.url}/api/redeploy/${opts.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: opts.description })
  });
  if (!res.ok) {
    console.error(`Redeploy failed: ${res.status}`);
    process.exit(1);
  }
  console.log('Redeploy triggered for', opts.id);
})();
