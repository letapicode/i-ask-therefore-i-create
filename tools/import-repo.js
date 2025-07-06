#!/usr/bin/env node
// Import an existing GitHub repo and run codegen enhancements
const [repo] = process.argv.slice(2);
if (!repo) {
  console.error('Usage: import-repo.js <repo-url>');
  process.exit(1);
}
console.log(`Would clone ${repo} and apply generators...`);
