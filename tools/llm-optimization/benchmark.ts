#!/usr/bin/env ts-node
import fetch from 'node-fetch';
import { Command } from 'commander';
import { performance } from 'perf_hooks';

export async function runBenchmark(url: string, runs = 3): Promise<number> {
  const prompt = 'benchmark';
  let tokens = 0;
  const start = performance.now();
  for (let i = 0; i < runs; i++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = (await res.json()) as { result: string };
    tokens += data.result.split(/\s+/).length;
  }
  const sec = (performance.now() - start) / 1000;
  return tokens / sec;
}

if (require.main === module) {
  const program = new Command();
  program
    .option('-u, --url <url>', 'model endpoint', process.env.CUSTOM_MODEL_URL || 'http://localhost:8001/generate')
    .option('-n, --runs <num>', 'number of requests', '3');
  program.parse(process.argv);
  const opts = program.opts();
  runBenchmark(opts.url, parseInt(opts.runs, 10)).then((tps) => {
    console.log(`Tokens per second: ${tps.toFixed(2)}`);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
