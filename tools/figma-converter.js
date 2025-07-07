#!/usr/bin/env node
const fs = require('fs');

function figmaToReact(data) {
  const nodes = data.document?.children || [];
  const children = nodes.map(n => `<div>${n.name}</div>`).join('\n  ');
  return `import React from 'react';\n\nexport default function Generated() {\n  return (\n    <div>\n      ${children}\n    </div>\n  );\n}\n`;
}

const input = process.argv[2];
const output = process.argv[3] || 'Generated.tsx';
if (!input) {
  console.error('Usage: figma-converter.js <figma.json> [out]');
  process.exit(1);
}
const json = JSON.parse(fs.readFileSync(input, 'utf-8'));
const code = figmaToReact(json);
fs.writeFileSync(output, code);
console.log('written', output);
