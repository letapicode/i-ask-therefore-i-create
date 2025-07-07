#!/usr/bin/env node
const fs = require('fs');
const path = '.events.json';

// simple audit logger copied from packages/shared/src/audit.ts
function logAudit(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync('audit.log', line);
}

// simplified retraining implementation mirroring apps/codegen/src/retrain.ts
function retrainModel() {
  updatePrompts();
  console.log('Model retraining triggered');
}

function updatePrompts(analyticsPath = 'analytics.json') {
  if (!fs.existsSync(analyticsPath)) return;
  const data = JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
  const ratings = {};
  for (const entry of data) {
    ratings[entry.prompt] = ratings[entry.prompt] || [];
    ratings[entry.prompt].push(entry.rating);
  }
  for (const [prompt, values] of Object.entries(ratings)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    console.log(`Prompt:"${prompt}" avg rating: ${avg.toFixed(2)}`);
  }
}

function read() {
  return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf-8')) : [];
}

async function main() {
  try {
    const ratings = read().filter((e) => e.type === 'rating');
    const avg =
      ratings.reduce((a, r) => a + Number(r.value || 0), 0) /
      (ratings.length || 1);

    const dir = 'services/analytics/training';
    fs.mkdirSync(dir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
      `${dir}/ratings-${ts}.json`,
      JSON.stringify(ratings, null, 2)
    );

    const histPath = `${dir}/history.json`;
    const history = fs.existsSync(histPath)
      ? JSON.parse(fs.readFileSync(histPath, 'utf8'))
      : [];
    history.push({ time: ts, count: ratings.length, avg });
    fs.writeFileSync(histPath, JSON.stringify(history, null, 2));

    console.log('Average rating', avg);
    if (ratings.length) retrainModel();
    logAudit(
      `training completed - ${ratings.length} ratings avg ${avg.toFixed(2)}`
    );
  } catch (err) {
    logAudit(`training failed: ${err.message}`);
    throw err;
  }
}

main();
