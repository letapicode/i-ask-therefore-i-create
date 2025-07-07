import express from 'express';
import fs from 'fs';
import { initSentry } from '../../packages/shared/src/sentry';
import { logAudit } from '../../packages/shared/src/audit';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`analytics ${req.method} ${req.url}`);
  next();
});

const DB_FILE = process.env.EVENT_DB || '.events.json';
const EXP_FILE = process.env.EXPERIMENT_DB || '.experiments.json';
const ALERT_THRESHOLD = Number(process.env.ALERT_THRESHOLD || '1000');

function readEvents(): any[] {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveEvents(events: any[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(events, null, 2));
}

function readExperiments(): any[] {
  if (!fs.existsSync(EXP_FILE)) return [];
  return JSON.parse(fs.readFileSync(EXP_FILE, 'utf-8'));
}

function saveExperiments(data: any[]) {
  fs.writeFileSync(EXP_FILE, JSON.stringify(data, null, 2));
}

app.post('/events', (req, res) => {
  const events = readEvents();
  events.push({ ...req.body, time: Date.now() });
  saveEvents(events);
  res.status(201).json({ ok: true });
});

app.post('/ratings', (req, res) => {
  const events = readEvents();
  events.push({ type: 'rating', value: req.body.value, time: Date.now() });
  saveEvents(events);
  res.status(201).json({ ok: true });
});

app.get('/metrics', (_req, res) => {
  const events = readEvents();
  res.json({ count: events.length });
});

app.get('/performance', (req, res) => {
  const { app, range } = req.query as { app?: string; range?: string };
  let events = readEvents().filter((e) => e.type === 'perf');
  if (app) events = events.filter((e) => e.app === app);
  if (range) {
    const since = Date.now() - Number(range) * 3600 * 1000;
    events = events.filter((e) => e.time >= since);
  }
  res.json(events.slice(-100));
});

app.get('/alerts', (req, res) => {
  const { app } = req.query as { app?: string };
  let events = readEvents().filter((e) => e.type === 'perf');
  if (app) events = events.filter((e) => e.app === app);
  const alerts = events.filter((e) => e.value > ALERT_THRESHOLD);
  res.json(alerts.slice(-20));
});

app.get('/summary', (_req, res) => {
  const events = readEvents();
  const summary: Record<string, number> = {};
  for (const e of events) {
    const type = e.type || 'unknown';
    summary[type] = (summary[type] || 0) + 1;
  }
  res.json(summary);
});

function generateRecommendations(events: any[]): string[] {
  const summary: Record<string, number> = {};
  for (const e of events) {
    const type = e.type || 'unknown';
    summary[type] = (summary[type] || 0) + 1;
  }
  const recs: string[] = [];
  if ((summary['createApp'] || 0) > 5) {
    recs.push('Explore the plugin marketplace to enhance your apps.');
  }
  if ((summary['error'] || 0) > 10) {
    recs.push('High error rate detected. Check build logs for failures.');
  }
  if (recs.length === 0) recs.push('No recommendations at this time.');
  return recs;
}

app.get('/recommendations', (_req, res) => {
  const events = readEvents();
  res.json({ recommendations: generateRecommendations(events) });
});

app.get('/complianceReport', (req, res) => {
  const policy = (req as any).policy as any;
  const events = readEvents();
  const report: Record<string, any> = {
    region: policy?.region || 'unknown',
    retentionDays: policy?.retentionDays || null,
    totalEvents: events.length,
    staleEvents: 0,
  };
  if (policy?.retentionDays) {
    const cutoff = Date.now() - policy.retentionDays * 24 * 3600 * 1000;
    report.staleEvents = events.filter((e) => e.time < cutoff).length;
  }
  res.json(report);
});

app.get('/experiments', (_req, res) => {
  res.json(readExperiments());
});

app.post('/experiments', (req, res) => {
  const list = readExperiments();
  const idx = list.findIndex((e) => e.id === req.body.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...req.body };
  else list.push({ ...req.body, created: Date.now() });
  saveExperiments(list);
  res.status(201).json({ ok: true });
});

app.get('/experiments/:id', (req, res) => {
  const exp = readExperiments().find((e) => e.id === req.params.id);
  if (!exp) return res.status(404).json({ error: 'not found' });
  res.json(exp);
});

export function start(port = 3001) {
  initSentry('analytics');
  app.listen(port, () => console.log(`analytics listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3001);
}
