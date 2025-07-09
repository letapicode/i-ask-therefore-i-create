#!/usr/bin/env node
const { Command } = require('commander');
const { execSync } = require('child_process');

const program = new Command();
program
  .requiredOption('-p, --platform <platform>', 'ios or android')
  .option('-c, --cwd <path>', 'path to project', '.');

program.parse(process.argv);
const opts = program.opts();

try {
  if (opts.platform === 'ios') {
    execSync('fastlane ios release', { stdio: 'inherit', cwd: opts.cwd });
  } else if (opts.platform === 'android') {
    execSync('fastlane android release', { stdio: 'inherit', cwd: opts.cwd });
  } else {
    throw new Error('Unknown platform');
  }
  console.log('Publish complete');
} catch (err) {
  console.error('Publish failed', err);
  process.exit(1);
}
