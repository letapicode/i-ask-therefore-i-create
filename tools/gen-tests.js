#!/usr/bin/env node
// Generate unit tests using OpenAI
const fs = require('fs');
const path = require('path');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: gen-tests.js <file>');
    process.exit(1);
  }
  const source = fs.readFileSync(file, 'utf8');
  // Placeholder: call OpenAI API to create tests
  console.log(`Would generate tests for ${file}`);
  console.log(source.substring(0, 100));
}

main();
