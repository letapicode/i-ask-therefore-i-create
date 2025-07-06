#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const strings = new Set();
function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (
      file.endsWith('.tsx') ||
      file.endsWith('.ts') ||
      file.endsWith('.js')
    ) {
      const text = fs.readFileSync(full, 'utf8');
      const matches = text.match(/>([^<>{}]*[a-zA-Z][^<>{}]*)</g) || [];
      for (const m of matches) strings.add(m.slice(1, -1).trim());
    }
  }
}
walk('apps/portal/src');
fs.writeFileSync('i18n-strings.json', JSON.stringify([...strings], null, 2));
console.log('extracted', strings.size, 'strings');
