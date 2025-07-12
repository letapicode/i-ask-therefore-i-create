import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
import { initSentry } from '../../packages/shared/src/sentry';
import { initTracing } from '../../packages/observability/src';
import { logAudit } from '../../packages/shared/src/audit';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import path from 'path';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`analytics ${req.method} ${req.url}`);
  next();
});

const DB_FILE = process.env.EVENT_DB || '.events.json';
const EXP_FILE = process.env.EXPERIMENT_DB || '.experiments.json';
const UI_FILE = process.env.UI_EVENTS_DB || '.ui-events.json';
const SUGG_FILE = process.env.UI_SUGGESTIONS_DB || '.ui-suggestions.json';
const CHAT_FILE = process.env.CHAT_DB || '.chat.json';
const AR_SESSION_FILE = process.env.AR_SESS_FILE || '.ar-sessions.json';
const SCORE_FILE = process.env.A11Y_SCORE_DB || '.a11y-scores.json';
const ALERT_THRESHOLD = Number(process.env.ALERT_THRESHOLD || '1000');
const SEC_DIR = path.resolve(__dirname, '../security');

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

function readUiEvents(): any[] {
  if (!fs.existsSync(UI_FILE)) return [];
  return JSON.parse(fs.readFileSync(UI_FILE, 'utf-8'));
}

function saveUiEvents(data: any[]) {
  fs.writeFileSync(UI_FILE, JSON.stringify(data, null, 2));
}

function readSuggestions(): any[] {
  if (!fs.existsSync(SUGG_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUGG_FILE, 'utf-8'));
}

function saveSuggestions(data: any[]) {
  fs.writeFileSync(SUGG_FILE, JSON.stringify(data, null, 2));
}

function readChats(): any[] {
  if (!fs.existsSync(CHAT_FILE)) return [];
  return JSON.parse(fs.readFileSync(CHAT_FILE, 'utf-8'));
}

function saveChats(data: any[]) {
  fs.writeFileSync(CHAT_FILE, JSON.stringify(data, null, 2));
}

function readScores(): any[] {
  if (!fs.existsSync(SCORE_FILE)) return [];
  return JSON.parse(fs.readFileSync(SCORE_FILE, 'utf-8'));
}

function saveScores(data: any[]) {
  fs.writeFileSync(SCORE_FILE, JSON.stringify(data, null, 2));
}

function readArSessions(): Record<string, any[]> {
  if (!fs.existsSync(AR_SESSION_FILE)) return {};
  return JSON.parse(fs.readFileSync(AR_SESSION_FILE, 'utf-8'));
}

function saveArSessions(data: Record<string, any[]>) {
  fs.writeFileSync(AR_SESSION_FILE, JSON.stringify(data, null, 2));
}
function readSecurityReports() {
  if (!fs.existsSync(SEC_DIR)) return [];
  const list = [];
  for (const name of fs.readdirSync(SEC_DIR)) {
    const auditPath = path.join(SEC_DIR, name, 'audit.json');
    if (!fs.existsSync(auditPath)) continue;
    const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
    const count = audit.vulnerabilities
      ? Object.keys(audit.vulnerabilities).length
      : 0;
    list.push({ project: name, vulnerabilities: count });
  }
  return list;
}

app.post('/events', (req, res) => {
  const events = readEvents();
  events.push({ ...req.body, time: Date.now() });
  saveEvents(events);
  res.status(201).json({ ok: true });
});

app.post('/uiEvent', (req, res) => {
  const list = readUiEvents();
  list.push({ ...req.body, time: Date.now() });
  saveUiEvents(list);
  updateSuggestions();
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

app.post('/chat', (req, res) => {
  const chats = readChats();
  chats.push({ ...req.body, time: Date.now() });
  saveChats(chats);
  res.status(201).json({ ok: true });
});

app.get('/chat', (_req, res) => {
  res.json(readChats().slice(-100));
});

app.get('/arSessions', (_req, res) => {
  const sessions = readArSessions();
  res.json({ sessions: Object.keys(sessions) });
});

app.post('/arSessions/:id', (req, res) => {
  const sessions = readArSessions();
  const list = sessions[req.params.id] || [];
  list.push({ ...req.body, time: Date.now() });
  sessions[req.params.id] = list;
  saveArSessions(sessions);
  res.status(201).json({ ok: true });
});

app.get('/arSessions/:id', (req, res) => {
  const sessions = readArSessions();
  res.json({ events: sessions[req.params.id] || [] });
});

app.post('/a11yScore', (req, res) => {
  const { project, score } = req.body as { project?: string; score?: number };
  if (!project || typeof score !== 'number') {
    return res.status(400).json({ error: 'invalid payload' });
  }
  const list = readScores();
  list.push({ project, score, time: Date.now() });
  saveScores(list);
  res.status(201).json({ ok: true });
});

app.get('/a11yScore', (req, res) => {
  const project = (req.query.project as string) || '';
  let list = readScores();
  if (project) list = list.filter((s) => s.project === project);
  res.json(list);
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

app.get('/uxSuggestions', (_req, res) => {
  const suggestions = updateSuggestions();
  res.json(suggestions);
});

app.post('/uxSuggestions/:id/apply', (req, res) => {
  const suggestions = readSuggestions();
  const idx = suggestions.findIndex((s: any) => s.id === req.params.id);
  if (idx >= 0) {
    suggestions.splice(idx, 1);
    saveSuggestions(suggestions);
    return res.json({ ok: true });
  }
  res.status(404).json({ error: 'not found' });
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

function summarizeEvents(events: any[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const e of events) {
    const type = e.type || 'unknown';
    summary[type] = (summary[type] || 0) + 1;
  }
  return summary;
}

function generateBusinessTips(events: any[]): string[] {
  const users = new Set<string>();
  let purchases = 0;
  let trials = 0;
  let conversions = 0;
  for (const e of events) {
    if (e.userId) users.add(e.userId);
    if (e.type === 'purchase') purchases++;
    if (e.type === 'trialStart') trials++;
    if (e.type === 'conversion') conversions++;
  }
  const tips: string[] = [];
  if (users.size > 10 && purchases === 0) {
    tips.push('Consider adding paid plans to monetize active users.');
  }
  if (trials > 0 && conversions / trials < 0.2) {
    tips.push('Improve onboarding to boost trial conversions.');
  }
  if (trials >= 5 && purchases < trials / 10) {
    tips.push('Offer incentives like discounts to convert trial users.');
  }
  if (tips.length === 0) tips.push('No monetization tips at this time.');
  return tips;
}

async function generateMarketingCopy(summary: Record<string, number>) {
  if (!process.env.OPENAI_API_KEY) {
    return "Promote your app's key features to attract users.";
  }
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Given the following event summary: ${JSON.stringify(
              summary
            )}, suggest short marketing copy highlighting unique selling points`,
          },
        ],
      }),
    });
    const data: any = await res.json();
    return (
      data.choices?.[0]?.message?.content ||
      "Promote your app's key features to attract users."
    );
  } catch {
    return "Promote your app's key features to attract users.";
  }
}

app.get('/businessTips', async (_req, res) => {
  const events = readEvents();
  const summary = summarizeEvents(events);
  const tips = generateBusinessTips(events);
  const marketing = await generateMarketingCopy(summary);
  res.json({ tips, marketing });
});

function generateUiSuggestions(events: any[]): any[] {
  const pageCounts: Record<string, number> = {};
  const elementCounts: Record<string, number> = {};
  for (const e of events) {
    pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
    if (e.element) {
      const key = `${e.page}|${e.element}`;
      elementCounts[key] = (elementCounts[key] || 0) + 1;
    }
  }
  const suggestions: any[] = [];
  Object.entries(pageCounts).forEach(([page, count]) => {
    if (count < 5) {
      suggestions.push({
        id: `page-${page}`,
        text: `Users rarely visit ${page}. Consider improving navigation to this page.`,
      });
    }
  });
  Object.entries(elementCounts).forEach(([key, count]) => {
    if (count < 3) {
      const [page, element] = key.split('|');
      suggestions.push({
        id: `el-${page}-${element}`,
        text: `Button ${element} on ${page} has low engagement. Try adjusting its placement or color.`,
      });
    }
  });
  return suggestions;
}

function updateSuggestions() {
  const events = readUiEvents();
  const suggestions = generateUiSuggestions(events);
  saveSuggestions(suggestions);
  return suggestions;
}

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

app.get('/securityReports', (_req, res) => {
  res.json(readSecurityReports());
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
  initTracing('analytics');
  initSentry('analytics');
  app.listen(port, () => console.log(`analytics listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3001);
}
