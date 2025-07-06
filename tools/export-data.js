#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const { scanTable, deleteItem } = require('../packages/shared/src/dynamo');

const program = new Command();
program
  .requiredOption('-t, --tenant <id>', 'tenant id')
  .option('-o, --out <file>', 'output file', 'export.json')
  .option('--delete', 'remove records after export')
  .option(
    '-j, --table <name>',
    'jobs table name',
    process.env.JOBS_TABLE || 'jobs'
  );

program.parse(process.argv);
const opts = program.opts();

(async () => {
  const all = await scanTable(opts.table);
  const items = all.filter((i) => i.tenantId === opts.tenant);
  fs.writeFileSync(opts.out, JSON.stringify(items, null, 2));
  console.log(`Exported ${items.length} records to ${opts.out}`);
  if (opts.delete) {
    for (const item of items) {
      await deleteItem(opts.table, { id: item.id });
    }
    console.log(`Deleted ${items.length} records`);
  }
})();
