#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function hasPolicyMiddleware(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (hasPolicyMiddleware(full)) return true;
    } else if (f.endsWith('.ts') || f.endsWith('.js')) {
      const text = fs.readFileSync(full, 'utf8');
      if (text.includes('policyMiddleware')) return true;
    }
  }
  return false;
}

const roots = ['apps', 'services'];
const report = {};
for (const r of roots) {
  for (const dir of fs.readdirSync(r)) {
    const full = path.join(r, dir);
    if (fs.statSync(full).isDirectory()) {
      report[`${r}/${dir}`] = hasPolicyMiddleware(path.join(full, 'src')) ? 'ok' : 'missing';
    }
  }
}
console.log('Compliance Coverage');
for (const [svc, status] of Object.entries(report)) {
  console.log(`${svc}: ${status}`);
}
