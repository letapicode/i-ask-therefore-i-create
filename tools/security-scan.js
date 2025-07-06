#!/usr/bin/env node
const { Command } = require('commander');
const { execSync } = require('child_process');

const program = new Command();
program
  .description('Run lint and dependency security checks')
  .option('-d, --dir <dir>', 'project directory', '.')
  .parse(process.argv);

const opts = program.opts();

try {
  execSync(`npx eslint ${opts.dir} --ext .ts,.js`, { stdio: 'inherit' });
  execSync('npm audit --audit-level=high', { stdio: 'inherit' });
  console.log('security scan complete');
} catch (err) {
  process.exitCode = 1;
}
