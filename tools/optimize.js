#!/usr/bin/env node
// Analyze AWS cost data and suggest optimizations
import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from '@aws-sdk/client-cloudwatch';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log('Analyzing costs...');
  const client = new CloudWatchClient({});
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  const cmd = new GetMetricStatisticsCommand({
    Namespace: 'AWS/EC2',
    MetricName: 'CPUUtilization',
    StartTime: start,
    EndTime: end,
    Period: 3600,
    Statistics: ['Average'],
  });
  const data = await client.send(cmd);
  const avg =
    data.Datapoints?.reduce((a, b) => a + (b.Average || 0), 0) /
    (data.Datapoints?.length || 1);
  if (avg < 20) {
    console.log('Low CPU usage detected. Consider downsizing instances.');
  } else {
    console.log('Utilization looks healthy.');
  }

  const eventsPath = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    '..',
    'services',
    'analytics',
    '.events.json'
  );
  let forecast = 0;
  if (fs.existsSync(eventsPath)) {
    const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
    const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
    const recent = events.filter((e: any) => e.time >= monthAgo);
    const COST_PER_EVENT = 0.01;
    forecast = recent.length * COST_PER_EVENT;
  }
  console.log(`Projected monthly expense: $${forecast.toFixed(2)}`);
}

run().catch((err) => console.error('cost analysis failed', err));
