#!/usr/bin/env node
import fs from 'fs';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';

export async function scan(file: string) {
  const html = fs.readFileSync(file, 'utf8');
  const dom = new JSDOM(html);
  (global as any).window = dom.window as any;
  (global as any).document = dom.window.document;
  return axe.run(dom.window.document.documentElement);
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: a11y-scan.ts <file>');
    process.exit(1);
  }
  scan(target).then((result) => {
    const out = 'a11y-report.json';
    fs.writeFileSync(out, JSON.stringify(result, null, 2));
    console.log(`Report written to ${out}`);
  });
}


