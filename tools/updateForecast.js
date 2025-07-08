#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { getCpuAverage } from './optimize.js';

async function run() {
  const eventsPath = path.join(__dirname, '..', 'services', 'analytics', '.events.json');
  const forecastPath = path.join(__dirname, '..', 'services', 'analytics', '.forecast.json');

  const events = fs.existsSync(eventsPath)
    ? JSON.parse(fs.readFileSync(eventsPath, 'utf-8'))
    : [];
  const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
  const recent = events.filter(e => e.time >= monthAgo);
  const count = recent.length;

  const cpuForecast = await getCpuAverage(30);
  const costForecast = cpuForecast * count;

  fs.writeFileSync(
    forecastPath,
    JSON.stringify({ cpuForecast, events: count, costForecast }, null, 2)
  );
  console.log(`Forecast saved to ${forecastPath}`);
}

run().catch(err => {
  console.error('forecast failed', err);
  process.exit(1);
});
