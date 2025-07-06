#!/usr/bin/env node
const readline = require('readline');
const fs = require('fs');
const { v4: uuid } = require('uuid');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question('Describe your data model: ', (answer) => {
  const id = uuid();
  fs.writeFileSync(
    `model-${id}.json`,
    JSON.stringify({ description: answer }, null, 2)
  );
  console.log('model saved to model-' + id + '.json');
  rl.close();
});
