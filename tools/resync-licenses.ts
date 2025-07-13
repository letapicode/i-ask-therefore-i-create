#!/usr/bin/env node
import fs from 'fs';
import { Command } from 'commander';
import { bridgeRecord } from '../packages/data-connectors/src/blockchain';

const program = new Command();
program
  .option('--source <file>', 'source ledger', 'ethereum-ledger.json')
  .option('--target <file>', 'target ledger', 'polygon-ledger.json')
  .option('--queue <file>', 'job queue', '.cross-chain-queue.json');

program.parse(process.argv);
const opts = program.opts();

interface Job {
  plugin: string;
  buyer: string;
  licenseKey: string;
  tx: string;
}

function readJobs(file: string): Job[] {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
}

function saveJobs(file: string, jobs: Job[]) {
  fs.writeFileSync(file, JSON.stringify(jobs, null, 2));
}

(async () => {
  const jobs = readJobs(opts.queue);
  const remaining: Job[] = [];
  for (const job of jobs) {
    try {
      bridgeRecord(job.tx, opts.source, opts.target);
      console.log(`bridged ${job.tx}`);
    } catch (err) {
      console.error(`failed to bridge ${job.tx}: ${(err as Error).message}`);
      remaining.push(job);
    }
  }
  saveJobs(opts.queue, remaining);
})();
