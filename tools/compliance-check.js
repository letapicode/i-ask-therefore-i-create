#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const banned = ['eval(', 'document.write'];

function scanDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) scanDir(full);
    else if (file.endsWith('.js') || file.endsWith('.ts')) {
      const text = fs.readFileSync(full, 'utf8');
      for (const b of banned) {
        if (text.includes(b))
          console.warn(`Compliance warning in ${full}: ${b}`);
      }
    }
  }
}

scanDir(process.argv[2] || '.');
