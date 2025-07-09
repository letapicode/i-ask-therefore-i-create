#!/usr/bin/env node
const { startPreview } = require('../apps/orchestrator/src/preview');
const id = process.env.GITHUB_SHA || Date.now().toString();

(async () => {
  const info = await startPreview(id);
  console.log(`Preview started at ${info.url} (expires ${new Date(info.expires).toISOString()})`);
})();
