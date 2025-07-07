import express from 'express';
import fs from 'fs';
import { initSentry } from '../../packages/shared/src/sentry';
import { logAudit } from '../../packages/shared/src/audit';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import { applyRetention, RegionPolicy } from '../../packages/shared/src/policy';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`analytics ${req.method} ${req.url}`);
  next();
});

const DB_FILE = process.env.EVENT_DB || '.events.json';
const EXP_FILE = process.env.EXPERIMENT_DB || '.experiments.json';

function readEvents(policy?: RegionPolicy): any[] {
  if (!fs.existsSync(DB_FILE)) return [];
  let events = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  if (policy) {
    events = applyRetention(events, policy.retentionDays).filter(
      (e: any) => !e.region || e.region === policy.region
    );
    fs.writeFileSync(DB_FILE, JSON.stringify(events, null, 2));
  }
  return events;
}

function saveEvents(events: any[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(events, null, 2));
}

function readExperiments(policy?: RegionPolicy): any[] {
  if (!fs.existsSync(EXP_FILE)) return [];
  let list = JSON.parse(fs.readFileSync(EXP_FILE, 'utf-8'));
  if (policy) {
    list = applyRetention(list, policy.retentionDays).filter(
      (e: any) => !e.region || e.region === policy.region
    );
    fs.writeFileSync(EXP_FILE, JSON.stringify(list, null, 2));
  }
  return list;
}

function saveExperiments(data: any[]) {
  fs.writeFileSync(EXP_FILE, JSON.stringify(data, null, 2));
}

app.post('/events', (req, res) => {
  const policy = (req as any).policy as RegionPolicy | undefined;
  const events = readEvents(policy);
  events.push({ ...req.body, region: policy?.region, time: Date.now() });
  saveEvents(events);
  res.status(201).json({ ok: true });
});

app.post('/ratings', (req, res) => {
  const policy = (req as any).policy as RegionPolicy | undefined;
  const events = readEvents(policy);
  events.push({
    type: 'rating',
    value: req.body.value,
    region: policy?.region,
    time: Date.now(),
  });
  saveEvents(events);
  res.status(201).json({ ok: true });
});

app.get('/metrics', (req, res) => {
  const policy = (req as any).policy as RegionPolicy | undefined;
  const events = readEvents(policy);
  res.json({ count: events.length });
});

app.get('/performance', (req, res) => {
  const policy = (req as any).policy as RegionPolicy | undefined;
  const events = readEvents(policy).filter((e) => e.type === 'perf');
  res.json(events.slice(-20));
});

app.get('/summary', (req, res) => {
  const policy = (req as any).policy as RegionPolicy | undefined;
  const events = readEvents(policy);
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

app.get('/recommendations', (req, res) => {
  const policy = (req as any).policy as RegionPolicy | undefined;
  const events = readEvents(policy);
  res.json({ recommendations: generateRecommendations(events) });
});

app.get('/experiments', (req, res) => {
  const policy = (req as any).policy as RegionPolicy | undefined;
  res.json(readExperiments(policy));
});

app.post('/experiments', (req, res) => {
  const policy = (req as any).policy as RegionPolicy | undefined;
  const list = readExperiments(policy);
  const idx = list.findIndex((e) => e.id === req.body.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...req.body };
  else list.push({ ...req.body, region: policy?.region, created: Date.now() });
  saveExperiments(list);
  res.status(201).json({ ok: true });
});

app.get('/experiments/:id', (req, res) => {
  const policy = (req as any).policy as RegionPolicy | undefined;
  const exp = readExperiments(policy).find((e) => e.id === req.params.id);
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
