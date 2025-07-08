#!/usr/bin/env node
const { Command } = require('commander');
const { execSync } = require('child_process');
const fs = require('fs');

const program = new Command();
program
  .description('Run OSS vulnerability checks and generate an SBOM file')
  .option('-d, --dir <dir>', 'project directory', '.')
  .option('-o, --sbom <file>', 'SBOM output file', 'sbom.json')
  .option('-l, --log <file>', 'log output file', 'security.log')
  .parse(process.argv);

const opts = program.opts();

let log = '';

function run(cmd) {
  const out = execSync(cmd, { cwd: opts.dir, stdio: 'pipe' });
  log += out.toString();
}

try {
  run('npx audit-ci --moderate');
  run(`npx cyclonedx-bom -o ${opts.sbom}`);
  fs.writeFileSync(opts.log, log);
  console.log('security scan complete');
} catch (err) {
  if (err.stdout) log += err.stdout.toString();
  if (err.stderr) log += err.stderr.toString();
  fs.writeFileSync(opts.log, log);
  console.error('security scan failed');
  process.exitCode = 1;
}
