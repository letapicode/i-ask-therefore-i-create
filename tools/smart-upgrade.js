#!/usr/bin/env node
const { execSync } = require('child_process');
const { Command } = require('commander');

const program = new Command();
program.option('-d, --dir <dir>', 'directory', '.').parse(process.argv);
const { dir } = program.opts();

try {
  execSync('npx npm-check-updates -u', { cwd: dir, stdio: 'inherit' });
  execSync('pnpm install', { cwd: dir, stdio: 'inherit' });
  execSync('pnpm test', { cwd: dir, stdio: 'inherit' });
  console.log('upgrade successful');
} catch (err) {
  console.error('tests failed, reverting');
  execSync('git reset --hard', { cwd: dir, stdio: 'inherit' });
  process.exitCode = 1;
}
