#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');

const program = new Command();
program
  .option('-m, --message <msg>', 'log message')
  .option('-f, --file <file>', 'log file', 'audit.log')
  .parse(process.argv);

const opts = program.opts();
if (!opts.message) {
  console.error('No message provided');
  process.exit(1);
}
const line = `[${new Date().toISOString()}] ${opts.message}\n`;
fs.appendFileSync(opts.file, line);
console.log('logged to', opts.file);
