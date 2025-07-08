#!/usr/bin/env node
const { Command } = require('commander');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const program = new Command();
program
  .requiredOption('-c, --connection <str>', 'postgres connection string')
  .option('-d, --dir <path>', 'migrations directory', 'packages/codegen-templates/migrations');

program.parse(process.argv);
const opts = program.opts();

(async () => {
  const client = new Client({ connectionString: opts.connection });
  await client.connect();
  await client.query('CREATE TABLE IF NOT EXISTS migrations (id text primary key)');
  const res = await client.query('SELECT id FROM migrations');
  const applied = new Set(res.rows.map(r => r.id));
  const files = fs.readdirSync(opts.dir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(opts.dir, file), 'utf8');
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO migrations(id) VALUES($1)', [file]);
      await client.query('COMMIT');
      console.log('applied', file);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('failed', file, err.message);
      process.exit(1);
    }
  }
  await client.end();
})();
