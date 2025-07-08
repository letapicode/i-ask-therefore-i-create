#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { logAudit } = require('../packages/shared/src/audit');

const appsDir = path.join(__dirname, 'apps');
const outDir = path.join(__dirname, 'services', 'analytics', 'security');
fs.mkdirSync(outDir, { recursive: true });

for (const name of fs.readdirSync(appsDir)) {
  const dir = path.join(appsDir, name);
  if (!fs.existsSync(path.join(dir, 'package.json'))) continue;
  const target = path.join(outDir, name);
  fs.mkdirSync(target, { recursive: true });
  try {
    execSync('npm audit --json > audit.json', {
      cwd: dir,
      stdio: 'inherit',
      shell: true,
    });
    execSync('npx @cyclonedx/bom -o sbom.xml', { cwd: dir, stdio: 'inherit' });
    fs.renameSync(
      path.join(dir, 'audit.json'),
      path.join(target, 'audit.json')
    );
    fs.renameSync(path.join(dir, 'sbom.xml'), path.join(target, 'sbom.xml'));
    logAudit(`security audit success for ${name}`);
  } catch (err) {
    logAudit(`security audit failed for ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}
console.log('security audits complete');
