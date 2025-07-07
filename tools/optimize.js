#!/usr/bin/env node
// Analyze AWS cost data and suggest optimizations
import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from '@aws-sdk/client-cloudwatch';

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
}

run().catch((err) => console.error('cost analysis failed', err));
