#!/usr/bin/env node
const fs = require('fs');
const { Command } = require('commander');
const fetch = require('node-fetch');

const program = new Command();
program
  .argument('<file>', 'source file to explain')
  .option('-u, --url <url>', 'model URL', process.env.CUSTOM_MODEL_URL)
  .parse(process.argv);
const opts = program.opts();
const file = program.args[0];

async function explain() {
  const code = fs.readFileSync(file, 'utf8');
  const prompt = `Explain the following code and suggest improvements:\n\n${code}`;
  const url = opts.url;
  if (!url && !process.env.OPENAI_API_KEY) {
    console.error('No model configured');
    return;
  }
  if (url) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    console.log(data.result);
  } else {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    console.log(data.choices?.[0]?.message?.content);
  }
}

explain();
