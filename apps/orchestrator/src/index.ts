import 'ts-node/register';
import express from 'express';
import { randomUUID } from 'crypto';
import fetch from 'node-fetch';
import {
  putItem,
  getItem,
  scanTable,
  deleteItem,
} from '../../packages/shared/src/dynamo';
import { uploadObject } from '../../packages/shared/src/s3';
import { sendEmail } from '../../services/email/src';
import { initSentry } from '../../packages/shared/src/sentry';
import { startSelfHealing, configure as configureHealing } from './selfHeal';
import fs from 'fs';
import path from 'path';
import { generateMigrations, Schema } from '../../packages/migrations/src';
import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from '@aws-sdk/client-cloudwatch';
import { logAudit } from '../../packages/shared/src/audit';
import { figmaToReact } from '../../packages/shared/src/figma';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import { anonymizeObject } from '../../packages/shared/src/pii';
import {
  loadModel,
  predict,
} from '../../packages/data-connectors/src/tfHelper';
import {
  produceKafka,
  putKinesis,
  appleConnector,
  googleConnector,
} from '../../packages/data-connectors/src';
import * as tf from '@tensorflow/tfjs';
import { generateSchema } from '../../packages/codegen-templates/src/graphqlBuilder';
import { runTemplateHooks } from '../../packages/codegen-templates/src/marketplace';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { startPreview, getPreview, cleanupPreviews } from './preview';
import { scan as scanA11y } from '../../../tools/a11y-scan';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`orchestrator ${req.method} ${req.url}`);
  next();
});

function anonymizeResponse(
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const json = res.json.bind(res);
  res.json = (body: any) => json(anonymizeObject(body));
  next();
}

app.use('/api/exportData', anonymizeResponse);

const JOBS_TABLE = process.env.JOBS_TABLE || 'jobs';
const CODEGEN_URL = process.env.CODEGEN_URL || 'http://localhost:3003/generate';
const DEPLOY_URL = process.env.DEPLOY_URL;
const GCP_DEPLOY_URL = process.env.GCP_DEPLOY_URL;
const AZURE_DEPLOY_URL = process.env.AZURE_DEPLOY_URL;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
const ARTIFACTS_BUCKET = process.env.ARTIFACTS_BUCKET;
const TENANT_HEADER = 'x-tenant-id';
const WORKFLOW_FILE = process.env.WORKFLOW_FILE || 'workflow.json';
const SCHEMA_FILE = process.env.SCHEMA_FILE || 'schema.json';
const CONNECTORS_TABLE = process.env.CONNECTORS_TABLE || 'connectors';
const PLUGINS_TABLE = process.env.PLUGINS_TABLE || 'plugins';
const PLUGIN_SERVICE_URL =
  process.env.PLUGIN_SERVICE_URL || 'http://localhost:3006';
const TENANTS_TABLE = process.env.TENANTS_TABLE || 'tenants';
const EVENTS_FILE = path.join(
  __dirname,
  '..',
  '..',
  'services',
  'analytics',
  '.events.json'
);
const FORECAST_FILE = path.join(
  __dirname,
  '..',
  '..',
  'services',
  'analytics',
  '.forecast.json'
);
const AR_LAYOUT_FILE = process.env.AR_LAYOUT_FILE || 'ar-layout.json';
const FED_TRAIN_URL = process.env.FED_TRAIN_URL || 'http://localhost:3010';
const SYN_DATA_URL = process.env.SYN_DATA_URL || 'http://localhost:3011';
const A11Y_ASSIST_URL = process.env.A11Y_ASSIST_URL || 'http://localhost:3012';

async function chatCompletion(message: string): Promise<string> {
  if (process.env.CUSTOM_MODEL_URL) {
    try {
      const res = await fetch(process.env.CUSTOM_MODEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message }),
      });
      const data = await res.json();
      return data.result || '';
    } catch {
      return 'Model unavailable';
    }
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return 'Model unavailable';
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      }),
    });
    const data: any = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch {
    return 'Model unavailable';
  }
}

async function getProvider(tenantId: string): Promise<'aws' | 'azure' | 'gcp'> {
  const cfg = await getItem<{ id: string; provider?: string }>(TENANTS_TABLE, {
    id: tenantId,
  });
  return (cfg?.provider as 'aws' | 'azure' | 'gcp') || 'aws';
}

export interface Job {
  id: string;
  tenantId: string;
  provider: 'aws' | 'gcp' | 'azure';
  description: string;
  language: string;
  status: 'queued' | 'running' | 'complete' | 'failed';
  created: number;
  previewUrl?: string;
  previewExpires?: number;
}

async function triggerDeploy(jobId: string, provider: string) {
  let url: string | undefined;
  if (provider === 'aws') url = DEPLOY_URL;
  if (provider === 'gcp') url = GCP_DEPLOY_URL;
  if (provider === 'azure') url = AZURE_DEPLOY_URL;
  if (!url) {
    console.log('deploy url not configured for provider', provider);
    return;
  }
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });
  } catch (err) {
    console.error('deploy failed', err);
  }
}

export async function publishMobile(jobId: string, tenantId: string) {
  const creds =
    (
      await getItem<{ tenantId: string; config: Record<string, any> }>(
        CONNECTORS_TABLE,
        { tenantId }
      )
    )?.config || {};
  if (!creds.appleKey || !creds.googleKey) {
    throw new Error('missing store credentials');
  }
  await appleConnector({ apiKey: creds.appleKey });
  await googleConnector({ apiKey: creds.googleKey });
}

export async function dispatchJob(job: Job) {
  try {
    await putItem(JOBS_TABLE, { ...job, status: 'running' });
    if (NOTIFY_EMAIL) {
      sendEmail({
        template: 'job-start',
        to: NOTIFY_EMAIL,
        data: { id: job.id },
      });
    }
    let schema = '';
    if (fs.existsSync(SCHEMA_FILE)) {
      const models = JSON.parse(fs.readFileSync(SCHEMA_FILE, 'utf-8'));
      schema = runTemplateHooks('graphql', generateSchema(models));
    }
    const genRes = await fetch(CODEGEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        description: job.description,
        language: job.language,
        schema,
        provider: job.provider,
        plugins:
          (
            await getItem<{ tenantId: string; plugins: string[] }>(
              PLUGINS_TABLE,
              { tenantId: job.tenantId }
            )
          )?.plugins || [],
      }),
    });
    const { code } = await genRes.json();
    if (ARTIFACTS_BUCKET && code) {
      await uploadObject(ARTIFACTS_BUCKET, `${job.id}.txt`, code);
    }
    await putItem(JOBS_TABLE, { ...job, status: 'complete' });
    await triggerDeploy(job.id, job.provider);
    if (NOTIFY_EMAIL) {
      sendEmail({
        template: 'job-complete',
        to: NOTIFY_EMAIL,
        data: { id: job.id },
      });
    }
  } catch (err) {
    await putItem(JOBS_TABLE, { ...job, status: 'failed' });
    if (NOTIFY_EMAIL) {
      sendEmail({
        template: 'job-failed',
        to: NOTIFY_EMAIL,
        data: { id: job.id },
      });
    }
  }
}

configureHealing(dispatchJob);

app.post('/api/createApp', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const { description, language = 'node', provider, preview } = req.body;
  if (!description)
    return res.status(400).json({ error: 'missing description' });
  const id = randomUUID();
  const prov: 'aws' | 'gcp' | 'azure' =
    provider || (await getProvider(tenantId));
  const job: Job = {
    id,
    tenantId,
    provider: prov,
    description,
    language,
    status: 'queued',
    created: Date.now(),
  };
  if (preview) {
    try {
      const info = await startPreview(id);
      job.previewUrl = info.url;
      job.previewExpires = info.expires;
    } catch (err) {
      console.error('preview start failed', err);
    }
  }
  await putItem(JOBS_TABLE, job);
  dispatchJob(job); // fire and forget
  res.status(202).json({ jobId: id });
});

app.get('/api/workflow', (_req, res) => {
  if (!fs.existsSync(WORKFLOW_FILE)) return res.json({});
  res.json(JSON.parse(fs.readFileSync(WORKFLOW_FILE, 'utf-8')));
});

app.post('/api/workflow', (req, res) => {
  fs.writeFileSync(WORKFLOW_FILE, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

app.get('/api/schema', (_req, res) => {
  if (!fs.existsSync(SCHEMA_FILE)) return res.json({});
  res.json(JSON.parse(fs.readFileSync(SCHEMA_FILE, 'utf-8')));
});

app.post('/api/schema', (req, res) => {
  const schema = req.body as Schema;
  fs.writeFileSync(SCHEMA_FILE, JSON.stringify(schema, null, 2));
  try {
    generateMigrations(schema);
  } catch (err) {
    console.error('migration generation failed', err);
  }
  res.json({ ok: true });
});

app.get('/api/arLayout', (_req, res) => {
  if (!fs.existsSync(AR_LAYOUT_FILE)) return res.json({ items: [] });
  res.json(JSON.parse(fs.readFileSync(AR_LAYOUT_FILE, 'utf-8')));
});

app.post('/api/arLayout', async (req, res) => {
  fs.writeFileSync(AR_LAYOUT_FILE, JSON.stringify(req.body, null, 2));
  const url = process.env.ANALYTICS_URL;
  if (url) {
    fetch(`${url}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'arLayout', layout: req.body }),
    }).catch(() => {});
  }
  res.json({ ok: true });
});

app.get('/api/status/:id', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const job = await getItem<Job>(JOBS_TABLE, { id: req.params.id });
  if (!job || job.tenantId !== tenantId)
    return res.status(404).json({ error: 'not found' });
  const preview = getPreview(job.id);
  if (preview) {
    job.previewUrl = preview.url;
    job.previewExpires = preview.expires;
  }
  res.json(job);
});

app.get('/api/apps', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const jobs = await scanTable<Job>(JOBS_TABLE);
  const tenantJobs = jobs.filter((j) => j.tenantId === tenantId);
  for (const j of tenantJobs) {
    const p = getPreview(j.id);
    if (p) {
      j.previewUrl = p.url;
      j.previewExpires = p.expires;
    }
  }
  res.json(tenantJobs);
});

app.get('/api/connectors', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const item = await getItem<{ tenantId: string; config: Record<string, any> }>(
    CONNECTORS_TABLE,
    { tenantId }
  );
  const allowed = [
    'stripeKey',
    'slackKey',
    'shopifyKey',
    'quickbooksKey',
    'zendeskKey',
    'appleKey',
    'googleKey',
    'kafkaBrokers',
    'kafkaTopic',
    'kinesisStream',
    'kinesisRegion',
  ];
  const result: Record<string, any> = {};
  for (const key of allowed) {
    if (item?.config[key]) result[key] = item.config[key];
  }
  res.json(result);
});

app.post('/api/connectors', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const existing = (await getItem<{
    tenantId: string;
    config: Record<string, any>;
  }>(CONNECTORS_TABLE, { tenantId })) || { tenantId, config: {} };
  const allowed = [
    'stripeKey',
    'slackKey',
    'shopifyKey',
    'quickbooksKey',
    'zendeskKey',
    'appleKey',
    'googleKey',
    'kafkaBrokers',
    'kafkaTopic',
    'kinesisStream',
    'kinesisRegion',
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      existing.config[key] = req.body[key];
    }
  }
  await putItem(CONNECTORS_TABLE, existing);
  res.status(201).json({ ok: true });
});

app.delete('/api/connectors/:type', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const item = await getItem<{ tenantId: string; config: Record<string, any> }>(
    CONNECTORS_TABLE,
    { tenantId }
  );
  if (!item || !item.config[req.params.type])
    return res.status(404).json({ error: 'not found' });
  delete item.config[req.params.type];
  await putItem(CONNECTORS_TABLE, item);
  res.json({ ok: true });
});

app.get('/api/plugins', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const item = await getItem<{ tenantId: string; plugins: string[] }>(
    PLUGINS_TABLE,
    { tenantId }
  );
  res.json(item?.plugins || []);
});

app.post('/api/plugins', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const name = req.body.name;
  const licenseKey = req.body.licenseKey;
  if (!name) return res.status(400).json({ error: 'missing name' });
  const existing = (await getItem<{ tenantId: string; plugins: string[] }>(
    PLUGINS_TABLE,
    {
      tenantId,
    }
  )) || { tenantId, plugins: [] };
  if (!existing.plugins.includes(name)) existing.plugins.push(name);
  await putItem(PLUGINS_TABLE, existing);
  try {
    await fetch(`${PLUGIN_SERVICE_URL}/install`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, licenseKey }),
    });
  } catch (err) {
    console.error('plugin service error', err);
  }
  res.status(201).json({ ok: true });
});

app.delete('/api/plugins/:name', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const item = await getItem<{ tenantId: string; plugins: string[] }>(
    PLUGINS_TABLE,
    { tenantId }
  );
  if (!item) return res.status(404).json({ error: 'not found' });
  item.plugins = item.plugins.filter((p) => p !== req.params.name);
  await putItem(PLUGINS_TABLE, item);
  try {
    await fetch(`${PLUGIN_SERVICE_URL}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: req.params.name }),
    });
  } catch (err) {
    console.error('plugin service error', err);
  }
  res.json({ ok: true });
});

app.post('/api/figma', (req, res) => {
  const code = figmaToReact(req.body);
  res.json({ code });
});

app.post('/api/predict', async (req, res) => {
  try {
    const modelPath =
      process.env.MODEL_PATH ||
      __dirname + '/../../../binary-assets/models/placeholder-model.json';
    const model = await loadModel('file://' + modelPath);
    const input = tf.tensor(req.body.input || []);
    const output = await predict(model, input);
    res.json({ result: Array.from((output as any).dataSync()) });
  } catch (err) {
    res.status(500).json({ error: 'prediction failed' });
  }
});

app.post('/api/testStream', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const { type, message = 'test' } = req.body;
  const cfg = await getItem<{ tenantId: string; config: Record<string, any> }>(
    CONNECTORS_TABLE,
    { tenantId }
  );
  if (!cfg) return res.status(400).json({ error: 'no config' });
  try {
    if (type === 'kafka') {
      await produceKafka(
        {
          brokers: (cfg.config.kafkaBrokers || '').split(',').filter(Boolean),
          topic: cfg.config.kafkaTopic,
        },
        message
      );
    } else if (type === 'kinesis') {
      await putKinesis(
        {
          streamName: cfg.config.kinesisStream,
          region: cfg.config.kinesisRegion,
        },
        message
      );
    } else {
      return res.status(400).json({ error: 'unknown type' });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'stream test failed' });
  }
});

app.post('/api/redeploy/:id', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const { description, language = 'node', provider } = req.body;
  if (!description)
    return res.status(400).json({ error: 'missing description' });
  const id = req.params.id;
  const prov: 'aws' | 'gcp' | 'azure' =
    provider || (await getProvider(tenantId));
  const job: Job = {
    id,
    tenantId,
    provider: prov,
    description,
    language,
    status: 'queued',
    created: Date.now(),
  };
  await putItem(JOBS_TABLE, job);
  dispatchJob(job);
  res.status(202).json({ jobId: id });
});

app.post('/api/publishMobile/:id', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const job = await getItem<Job>(JOBS_TABLE, { id: req.params.id });
  if (!job || job.tenantId !== tenantId)
    return res.status(404).json({ error: 'not found' });
  try {
    await publishMobile(job.id, tenantId);
    res.json({ ok: true });
  } catch (err) {
    console.error('publish failed', err);
    res.status(500).json({ error: 'publish failed' });
  }
});

app.get('/api/exportData', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const policy = (req as any).policy as any;
  let items = (await scanTable<Job>(JOBS_TABLE)).filter(
    (i) => i.tenantId === tenantId
  );
  if (policy?.retentionDays) {
    const cutoff = Date.now() - policy.retentionDays * 24 * 3600 * 1000;
    items = items.filter((i) => (i.created || 0) >= cutoff);
  }
  res.json(items);
});

app.delete('/api/exportData', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const policy = (req as any).policy as any;
  let items = (await scanTable<Job>(JOBS_TABLE)).filter(
    (i) => i.tenantId === tenantId
  );
  if (policy?.retentionDays) {
    const cutoff = Date.now() - policy.retentionDays * 24 * 3600 * 1000;
    items = items.filter((i) => (i.created || 0) >= cutoff);
  }
  for (const item of items) {
    await deleteItem(JOBS_TABLE, { id: item.id });
  }
  res.json({ deleted: items.length });
});

async function fetchAnalyticsCount() {
  try {
    const res = await fetch('http://localhost:3001/metrics');
    const json = await res.json();
    return json.count || 0;
  } catch {
    return 0;
  }
}

async function getCpuSeries(days = 14) {
  const client = new CloudWatchClient({});
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const cmd = new GetMetricStatisticsCommand({
    Namespace: 'AWS/EC2',
    MetricName: 'CPUUtilization',
    StartTime: start,
    EndTime: end,
    Period: 86400,
    Statistics: ['Average'],
  });
  const data = await client.send(cmd);
  const list = (data.Datapoints || [])
    .sort(
      (a, b) => (a.Timestamp?.getTime() || 0) - (b.Timestamp?.getTime() || 0)
    )
    .map((d) => d.Average || 0);
  return list;
}

function smooth(values: number[], alpha = 0.5) {
  if (!values.length) return 0;
  let forecast = values[0];
  for (let i = 1; i < values.length; i++) {
    forecast = alpha * values[i] + (1 - alpha) * forecast;
  }
  return forecast;
}

app.get('/api/costForecast', async (_req, res) => {
  try {
    const [count, series] = await Promise.all([
      fetchAnalyticsCount(),
      getCpuSeries(),
    ]);
    const cpuForecast = smooth(series);
    const costForecast = cpuForecast * count;
    res.json({ cpuForecast, events: count, costForecast });
  } catch {
    res.status(500).json({ error: 'forecast failed' });
  }
});

app.post('/api/modelUpdate', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  try {
    const response = await fetch(`${FED_TRAIN_URL}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, weights: req.body.weights || [] }),
    });
    const json = await response.json();
    res.status(response.status).json(json);
  } catch {
    res.status(500).json({ error: 'federated service unavailable' });
  }
});

app.post('/api/a11yReport', async (req, res) => {
  const path = req.body.path as string;
  if (!path) return res.status(400).json({ error: 'missing path' });
  try {
    const results = await scanA11y(path);
    try {
      await fetch(`${A11Y_ASSIST_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: path, violations: results.violations }),
      });
    } catch (err) {
      console.error('a11y assistant unavailable', err);
    }
    res.json({ violations: results.violations });
  } catch {
    res.status(500).json({ error: 'scan failed' });
  }
});

app.get('/api/a11yTips', async (req, res) => {
  const project = (req.query.project as string) || '';
  try {
    const response = await fetch(
      `${A11Y_ASSIST_URL}/tips?project=${encodeURIComponent(project)}`
    );
    const json = await response.json();
    res.status(response.status).json(json);
  } catch {
    res.status(500).json({ error: 'service unavailable' });
  }
});

app.post('/api/syntheticData', async (req, res) => {
  const { template, count } = req.body as { template?: string; count?: number };
  if (!template) return res.status(400).json({ error: 'missing template' });
  try {
    const response = await fetch(`${SYN_DATA_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, count }),
    });
    const json = await response.json();
    res.status(response.status).json(json);
  } catch {
    res.status(500).json({ error: 'service unavailable' });
  }
});

app.get('/api/policy', (req, res) => {
  res.json((req as any).policy || {});
});

export function start(port = 3002) {
  initSentry('orchestrator');
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/chat' });
  wss.on('connection', (ws) => {
    ws.on('message', async (data) => {
      const text = data.toString();
      const reply = await chatCompletion(text);
      ws.send(reply);
      const url = process.env.ANALYTICS_URL;
      if (url) {
        fetch(`${url}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'user', content: text }),
        }).catch(() => {});
        fetch(`${url}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'assistant', content: reply }),
        }).catch(() => {});
      }
    });
  });
  server.listen(port, () => console.log(`orchestrator listening on ${port}`));
  if (process.env.SELF_HEAL) {
    startSelfHealing();
  }
  cleanupPreviews();
  return server;
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3002);
}
