#!/usr/bin/env node
// Generate unit tests using OpenAI
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: gen-tests.js <file>');
    process.exit(1);
  }
  const source = fs.readFileSync(file, 'utf8');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set');
    process.exit(1);
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Write Jest tests for the following code:\n\n${source}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI request failed: ${res.status}`);
  }
  const data = await res.json();
  const tests = data.choices?.[0]?.message?.content || '';
  const out = path.join(path.dirname(file), path.basename(file).replace(/\.ts$/, '.test.ts'));
  fs.writeFileSync(out, tests);
  console.log('Generated tests at', out);
}

main();
