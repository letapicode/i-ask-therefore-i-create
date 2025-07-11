import express from 'express';
import fs from 'fs';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import { logAudit } from '../../packages/shared/src/audit';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`a11y-assistant ${req.method} ${req.url}`);
  next();
});

const DB_FILE = process.env.A11Y_DB || '.a11y-history.json';

interface HistoryEntry {
  project: string;
  violations: { id: string; help: string }[];
  time: number;
}

function readHistory(): HistoryEntry[] {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as HistoryEntry[];
}

function saveHistory(list: HistoryEntry[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2));
}

app.post('/history', (req, res) => {
  const { project, violations } = req.body as {
    project?: string;
    violations?: { id: string; help: string }[];
  };
  if (!project || !Array.isArray(violations)) {
    return res.status(400).json({ error: 'invalid payload' });
  }
  const list = readHistory();
  list.push({ project, violations, time: Date.now() });
  saveHistory(list);
  res.status(201).json({ ok: true });
});

app.get('/tips', (req, res) => {
  const project = (req.query.project as string) || '';
  const data = readHistory().filter((h) => !project || h.project === project);
  const counts: Record<string, { help: string; count: number }> = {};
  for (const h of data) {
    for (const v of h.violations) {
      const entry = counts[v.id] || { help: v.help, count: 0 };
      entry.count++;
      counts[v.id] = entry;
    }
  }
  const tips = Object.entries(counts)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([id, val]) => ({ id, text: val.help, occurrences: val.count }));
  res.json({ tips });
});

export function start(port = 3012) {
  app.listen(port, () => console.log(`a11y assistant listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3012);
}
