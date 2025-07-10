#!/usr/bin/env node
import { Command } from 'commander';
import { generateData } from '../services/synthetic-data/src';

const program = new Command();
program
  .argument('<template>', 'template name')
  .option('-c, --count <number>', 'number of rows', '10')
  .action((template, options) => {
    const count = parseInt(options.count, 10) || 10;
    const data = generateData(template, count);
    console.log(JSON.stringify(data, null, 2));
  });

program.parse(process.argv);
