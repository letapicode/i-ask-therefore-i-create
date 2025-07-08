#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { uploadObject } = require('../../packages/shared/src/s3');

function flatten(deps, list = []) {
  for (const [name, info] of Object.entries(deps || {})) {
    list.push({ name, version: info.version });
    if (info.dependencies) flatten(info.dependencies, list);
  }
  return list;
}

async function run() {
  const sbomPath = path.join(process.cwd(), 'sbom.json');
  const out = execSync('npm ls --all --json', { encoding: 'utf8' });
  const tree = JSON.parse(out);
  const packages = flatten(tree.dependencies || {});
  const sbom = { version: 1, packages };
  fs.writeFileSync(sbomPath, JSON.stringify(sbom, null, 2));
  console.log('SBOM written to', sbomPath);
  if (process.env.ARTIFACTS_BUCKET) {
    await uploadObject(process.env.ARTIFACTS_BUCKET, 'sbom.json', JSON.stringify(sbom));
  }
}

run().catch(err => { console.error('sbom generation failed', err); process.exit(1); });
