#!/usr/bin/env node
const fs = require('fs');
const path = '.events.json';
const { retrainModel } = require('../apps/codegen/dist/retrain');

function read() {
  return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf-8')) : [];
}

async function main() {
  const ratings = read().filter((e) => e.type === 'rating');
  const avg =
    ratings.reduce((a, r) => a + Number(r.value || 0), 0) /
    (ratings.length || 1);
  console.log('Average rating', avg);
  if (ratings.length) await retrainModel();
}

main();
