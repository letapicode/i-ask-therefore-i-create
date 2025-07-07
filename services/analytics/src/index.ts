import express from 'express';
import fs from 'fs';
import { initSentry } from '../../packages/shared/src/sentry';
import { logAudit } from '../../packages/shared/src/audit';

export const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  logAudit(`analytics ${req.method} ${req.url}`);
  next();
});

const DB_FILE = process.env.EVENT_DB || '.events.json';

function readEvents(): any[] {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveEvents(events: any[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(events, null, 2));
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

app.get('/performance', (_req, res) => {
  const events = readEvents().filter((e) => e.type === 'perf');
  res.json(events.slice(-20));
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

export function start(port = 3001) {
  initSentry('analytics');
  app.listen(port, () => console.log(`analytics listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3001);
}
