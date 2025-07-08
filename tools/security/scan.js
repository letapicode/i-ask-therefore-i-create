#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { uploadObject } = require('../../packages/shared/src/s3');

async function osvScan(deps) {
  const results = {};
  for (const [name, version] of Object.entries(deps)) {
    try {
      const res = await fetch('https://api.osv.dev/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: { name, ecosystem: 'npm', purl: `pkg:npm/${name}@${version}` } }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.vulns && data.vulns.length) {
        results[name] = data.vulns.map(v => v.id);
      }
    } catch {
      // ignore network errors
    }
  }
  return results;
}

async function run() {
  const reportPath = path.join(process.cwd(), 'security-report.json');
  let auditData = {};
  try {
    const out = execSync('npm audit --json', { encoding: 'utf8' });
    auditData = JSON.parse(out);
  } catch (err) {
    if (err.stdout) {
      try { auditData = JSON.parse(err.stdout.toString()); } catch {}
    }
  }
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const osv = await osvScan(pkg.dependencies || {});
  const summary = { vulnerabilities: auditData.metadata ? auditData.metadata.vulnerabilities : {}, osv };
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log('Security report written to', reportPath);
  if (process.env.ARTIFACTS_BUCKET) {
    await uploadObject(process.env.ARTIFACTS_BUCKET, 'security-report.json', JSON.stringify(summary));
  }
  const { high = 0, critical = 0 } = summary.vulnerabilities || {};
  if (high > 0 || critical > 0) {
    console.error('High severity issues found');
    process.exitCode = 1;
  }
}

run().catch(err => { console.error('security scan failed', err); process.exit(1); });
