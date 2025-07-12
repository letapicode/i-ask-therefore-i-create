import express from 'express';
import fs from 'fs';
import path from 'path';
import { ESLint } from 'eslint';

export const app = express();
app.use(express.json());

async function runLint(dir: string): Promise<number> {
  const eslint = new ESLint({
    cwd: dir,
    useEslintrc: false,
    baseConfig: {
      env: { node: true, es6: true },
      extends: ['eslint:recommended'],
    },
  });
  const results = await eslint.lintFiles(['**/*.js', '**/*.ts']);
  return results.reduce((c, r) => c + r.errorCount, 0);
}

function scanDependencies(dir: string): number {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) return 0;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as any;
  const vulns = ['lodash', 'jquery'];
  const deps = Object.keys(pkg.dependencies || {});
  return deps.filter((d) => vulns.includes(d)).length;
}

app.post('/review', async (req, res) => {
  const { repo } = req.body as { repo?: string };
  if (!repo) return res.status(400).json({ error: 'repo required' });
  try {
    const lintErrors = await runLint(repo);
    const vulnerabilities = scanDependencies(repo);
    res.json({ lintErrors, vulnerabilities });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export function start(port = 3013) {
  app.listen(port, () => console.log(`code-review listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3013);
}
