#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const { scanTable } = require('../packages/shared/src/dynamo');

const program = new Command();
program
  .requiredOption('-r, --region <code>', 'region code')
  .option('-o, --out <file>', 'output file', 'region-export.json')
  .option('-j, --table <name>', 'jobs table', process.env.JOBS_TABLE || 'jobs');

program.parse(process.argv);
const opts = program.opts();

(async () => {
  const all = await scanTable(opts.table);
  const items = all.filter((i) => i.region === opts.region);
  fs.writeFileSync(opts.out, JSON.stringify(items, null, 2));
  console.log(`Exported ${items.length} records for ${opts.region}`);
})();
