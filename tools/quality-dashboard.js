#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

try {
  execSync('pnpm test -- --coverage', { stdio: 'inherit' });
  const summary = JSON.parse(
    fs.readFileSync('coverage/coverage-summary.json', 'utf8')
  );
  for (const [file, stats] of Object.entries(summary)) {
    if (file === 'total') continue;
    console.log(`${file} - ${stats.lines.pct}% lines covered`);
  }
  console.log('overall', summary.total.lines.pct + '%');
} catch (err) {
  console.error('failed to generate coverage');
  process.exitCode = 1;
}
