#!/usr/bin/env node
const { Command } = require('commander');
const { execSync } = require('child_process');

const program = new Command();
program
  .description('Upgrade dependencies and install patches')
  .option('-d, --dir <dir>', 'project directory', '.')
  .parse(process.argv);

const opts = program.opts();

try {
  execSync(`npx npm-check-updates -u`, { cwd: opts.dir, stdio: 'inherit' });
  execSync('pnpm install', { cwd: opts.dir, stdio: 'inherit' });
  console.log('dependencies updated');
} catch (err) {
  process.exitCode = 1;
}
