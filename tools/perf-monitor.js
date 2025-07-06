#!/usr/bin/env node
const { Command } = require('commander');
const {
  CloudWatchClient,
  GetMetricDataCommand,
} = require('@aws-sdk/client-cloudwatch');

const program = new Command();
program
  .description('Stream CloudWatch metrics to the console')
  .option('-n, --namespace <ns>', 'CloudWatch namespace', 'AWS/Lambda')
  .option('-m, --metric <name>', 'Metric name', 'Invocations')
  .option('-i, --interval <sec>', 'Polling interval in seconds', '15')
  .option('-f, --function <fn>', 'Lambda function name')
  .parse(process.argv);

const opts = program.opts();

if (!opts.function) {
  console.error('Function name is required. Use -f <function>');
  process.exit(1);
}

const client = new CloudWatchClient({});
async function poll() {
  const end = new Date();
  const start = new Date(end.getTime() - 60 * 1000);
  const params = {
    StartTime: start,
    EndTime: end,
    MetricDataQueries: [
      {
        Id: 'm1',
        MetricStat: {
          Metric: {
            Namespace: opts.namespace,
            MetricName: opts.metric,
            Dimensions: [{ Name: 'FunctionName', Value: opts.function }],
          },
          Period: 60,
          Stat: 'Sum',
        },
      },
    ],
  };
  try {
    const res = await client.send(new GetMetricDataCommand(params));
    const val = res.MetricDataResults?.[0]?.Values?.[0] || 0;
    console.log(`[${new Date().toISOString()}] ${opts.metric}: ${val}`);
  } catch (err) {
    console.error('Error fetching metrics', err);
  }
}

console.log('Streaming metrics... press Ctrl+C to exit.');
setInterval(poll, parseInt(opts.interval, 10) * 1000);
poll();
