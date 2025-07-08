#!/usr/bin/env node
const { Command } = require('commander');
const { execSync } = require('child_process');

const program = new Command();
program
  .description('Run OWASP dependency checks and license audits')
  .option('-d, --dir <dir>', 'project directory', '.')
  .parse(process.argv);

const opts = program.opts();

try {
  console.log('Running OWASP dependency check...');
  execSync(
    `npx owasp-dependency-check --project generated --scan ${opts.dir}`,
    { stdio: 'inherit' }
  );

  console.log('Running license audit...');
  execSync('npx license-checker --summary', {
    cwd: opts.dir,
    stdio: 'inherit',
  });

  console.log('security scan complete');
} catch (err) {
  process.exitCode = 1;
}
