import express from 'express';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import { logAudit } from '../../packages/shared/src/audit';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`query-optimizer ${req.method} ${req.url}`);
  next();
});

const STATS_DB = process.env.QUERY_STATS_DB || '.query-stats.json';
const REC_DB = process.env.REC_DB || '.query-recs.json';
const SLOW_MS = Number(process.env.SLOW_QUERY_MS || '200');

interface Stat {
  id: string;
  appId: string;
  query: string;
  duration: number;
  time: number;
}

interface Recommendation {
  id: string;
  appId: string;
  query: string;
  suggestion: string;
  applied?: boolean;
}

function readStats(): Stat[] {
  return fs.existsSync(STATS_DB)
    ? (JSON.parse(fs.readFileSync(STATS_DB, 'utf8')) as Stat[])
    : [];
}

function saveStats(list: Stat[]) {
  fs.writeFileSync(STATS_DB, JSON.stringify(list, null, 2));
}

function readRecs(): Recommendation[] {
  return fs.existsSync(REC_DB)
    ? (JSON.parse(fs.readFileSync(REC_DB, 'utf8')) as Recommendation[])
    : [];
}

function saveRecs(list: Recommendation[]) {
  fs.writeFileSync(REC_DB, JSON.stringify(list, null, 2));
}

function analyze() {
  const stats = readStats();
  const recs = readRecs();
  const grouped: Record<
    string,
    { total: number; count: number; query: string; appId: string }
  > = {};
  for (const s of stats) {
    const key = `${s.appId}|${s.query}`;
    const g = grouped[key] || {
      total: 0,
      count: 0,
      query: s.query,
      appId: s.appId,
    };
    g.total += s.duration;
    g.count++;
    grouped[key] = g;
  }
  for (const g of Object.values(grouped)) {
    const avg = g.total / g.count;
    if (
      avg > SLOW_MS &&
      !recs.find((r) => r.appId === g.appId && r.query === g.query)
    ) {
      recs.push({
        id: randomUUID(),
        appId: g.appId,
        query: g.query,
        suggestion: `Consider indexing or rewriting query: ${g.query}`,
      });
    }
  }
  saveRecs(recs);
}

app.post('/stats', (req, res) => {
  const { appId, query, duration } = req.body as {
    appId?: string;
    query?: string;
    duration?: number;
  };
  if (!appId || !query || typeof duration !== 'number') {
    return res.status(400).json({ error: 'invalid payload' });
  }
  const list = readStats();
  list.push({ id: randomUUID(), appId, query, duration, time: Date.now() });
  saveStats(list);
  analyze();
  res.status(201).json({ ok: true });
});

app.get('/recommendations', (req, res) => {
  const appId = req.query.appId as string | undefined;
  const recs = readRecs().filter((r) => !appId || r.appId === appId);
  res.json(recs);
});

app.post('/recommendations/:id/apply', (req, res) => {
  const list = readRecs();
  const rec = list.find((r) => r.id === req.params.id);
  if (!rec) return res.status(404).json({ error: 'not found' });
  rec.applied = true;
  saveRecs(list);
  res.json({ ok: true });
});

export function start(port = 3015) {
  app.listen(port, () => console.log(`query optimizer listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3015);
}
