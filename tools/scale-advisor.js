#!/usr/bin/env node
const { Command } = require('commander');
const { CloudWatchClient, GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch');

const program = new Command();
program
  .description('Recommend scaling actions based on Lambda concurrency metrics')
  .option('-f, --function <name>', 'Lambda function name')
  .option('-p, --period <min>', 'lookback period in minutes', '30')
  .parse(process.argv);

const opts = program.opts();
if (!opts.function) {
  console.error('Function name required');
  process.exit(1);
}

const client = new CloudWatchClient({});
(async () => {
  const end = new Date();
  const start = new Date(end.getTime() - parseInt(opts.period) * 60 * 1000);
  const params = new GetMetricStatisticsCommand({
    Namespace: 'AWS/Lambda',
    MetricName: 'ConcurrentExecutions',
    Dimensions: [{ Name: 'FunctionName', Value: opts.function }],
    StartTime: start,
    EndTime: end,
    Period: 60,
    Statistics: ['Average']
  });
  const { Datapoints } = await client.send(params);
  const avg = Datapoints.reduce((a, d) => a + d.Average, 0) / Datapoints.length || 0;
  if (avg > 80) console.log('High load detected. Consider increasing provisioned concurrency.');
  else if (avg < 20) console.log('Low usage. Scale down to save cost.');
  else console.log('Current scaling seems adequate.');
})();
