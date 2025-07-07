#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const src = process.argv[2] || '.';
const dest = process.argv[3] || 'backups';

if (!fs.existsSync(dest)) fs.mkdirSync(dest);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const out = path.join(dest, stamp);
fs.cpSync(src, out, { recursive: true });
console.log('backup created at', out);
