#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import { anonymizeObject } from '../packages/shared/src/pii';

function inferFormat(file: string): 'json' | 'csv' {
  return file.endsWith('.csv') ? 'csv' : 'json';
}

function anonymizeJson(input: string): string {
  const data = JSON.parse(input);
  const sanitized = Array.isArray(data)
    ? data.map((d) => anonymizeObject(d))
    : anonymizeObject(data);
  return JSON.stringify(sanitized, null, 2);
}

function anonymizeCsv(input: string): string {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return input;
  const header = lines[0].split(',');
  const out = [lines[0]];
  for (const line of lines.slice(1)) {
    if (!line) continue;
    const values = line.split(',');
    const obj: Record<string, string> = {};
    header.forEach((h, i) => {
      obj[h] = values[i] || '';
    });
    const sanitized = anonymizeObject(obj);
    out.push(header.map((h) => sanitized[h]).join(','));
  }
  return out.join('\n');
}

const program = new Command();
program
  .requiredOption('-i, --input <file>', 'input file')
  .option('-o, --output <file>', 'output file');

program.parse(process.argv);
const opts = program.opts();

const format = inferFormat(opts.input);
const output = opts.output || `anonymized.${format}`;
const data = fs.readFileSync(opts.input, 'utf8');
const result = format === 'csv' ? anonymizeCsv(data) : anonymizeJson(data);
fs.writeFileSync(output, result);
console.log(`Anonymized data written to ${output}`);
