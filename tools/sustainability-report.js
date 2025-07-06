#!/usr/bin/env node
const {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} = require('@aws-sdk/client-cloudwatch');
const client = new CloudWatchClient({});

async function run() {
  const cmd = new GetMetricStatisticsCommand({
    Namespace: 'AWS/Lambda',
    MetricName: 'Duration',
    StartTime: new Date(Date.now() - 86400000),
    EndTime: new Date(),
    Period: 86400,
    Statistics: ['Average'],
  });
  const data = await client.send(cmd);
  const avgMs = data.Datapoints?.[0]?.Average || 0;
  const kwh = (avgMs / 1000) * 0.00002; // rough estimate
  console.log('Estimated daily energy usage:', kwh.toFixed(6), 'kWh');
}
run();
