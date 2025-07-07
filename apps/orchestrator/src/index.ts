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
import { logAudit } from '../../packages/shared/src/audit';
import { figmaToReact } from '../../packages/shared/src/figma';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import {
  loadModel,
  predict,
} from '../../packages/data-connectors/src/tfHelper';
import * as tf from '@tensorflow/tfjs';
import { generateSchema } from '../../packages/codegen-templates/src/graphqlBuilder';
import { runTemplateHooks } from '../../packages/codegen-templates/src/marketplace';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`orchestrator ${req.method} ${req.url}`);
  next();
});

const JOBS_TABLE = process.env.JOBS_TABLE || 'jobs';
const CODEGEN_URL = process.env.CODEGEN_URL || 'http://localhost:3003/generate';
const DEPLOY_URL = process.env.DEPLOY_URL;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
const ARTIFACTS_BUCKET = process.env.ARTIFACTS_BUCKET;
const TENANT_HEADER = 'x-tenant-id';
const WORKFLOW_FILE = process.env.WORKFLOW_FILE || 'workflow.json';
const SCHEMA_FILE = process.env.SCHEMA_FILE || 'schema.json';
const CONNECTORS_TABLE = process.env.CONNECTORS_TABLE || 'connectors';
const PLUGINS_TABLE = process.env.PLUGINS_TABLE || 'plugins';
const PLUGIN_SERVICE_URL =
  process.env.PLUGIN_SERVICE_URL || 'http://localhost:3006';

export interface Job {
  id: string;
  tenantId: string;
  description: string;
  language: string;
  status: 'queued' | 'running' | 'complete' | 'failed';
}

async function triggerDeploy(jobId: string) {
  if (!DEPLOY_URL) {
    console.log('deploy url not configured, skipping deploy');
    return;
  }
  try {
    await fetch(DEPLOY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });
  } catch (err) {
    console.error('deploy failed', err);
  }
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
    await triggerDeploy(job.id);
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
  const { description, language = 'node' } = req.body;
  if (!description)
    return res.status(400).json({ error: 'missing description' });
  const id = randomUUID();
  const job: Job = { id, tenantId, description, language, status: 'queued' };
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
  fs.writeFileSync(SCHEMA_FILE, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

app.get('/api/status/:id', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const job = await getItem<Job>(JOBS_TABLE, { id: req.params.id });
  if (!job || job.tenantId !== tenantId)
    return res.status(404).json({ error: 'not found' });
  res.json(job);
});

app.get('/api/apps', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const jobs = await scanTable<Job>(JOBS_TABLE);
  res.json(jobs.filter((j) => j.tenantId === tenantId));
});

app.get('/api/connectors', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const item = await getItem<{ tenantId: string; config: Record<string, any> }>(
    CONNECTORS_TABLE,
    { tenantId }
  );
  res.json(item?.config || {});
});

app.post('/api/connectors', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const existing = (await getItem<{
    tenantId: string;
    config: Record<string, any>;
  }>(CONNECTORS_TABLE, { tenantId })) || { tenantId, config: {} };
  existing.config = { ...existing.config, ...req.body };
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
      body: JSON.stringify({ name }),
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

app.post('/api/redeploy/:id', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const { description, language = 'node' } = req.body;
  if (!description)
    return res.status(400).json({ error: 'missing description' });
  const id = req.params.id;
  const job: Job = { id, tenantId, description, language, status: 'queued' };
  await putItem(JOBS_TABLE, job);
  dispatchJob(job);
  res.status(202).json({ jobId: id });
});

app.get('/api/policy', (req, res) => {
  res.json((req as any).policy || {});
});

export function start(port = 3002) {
  initSentry('orchestrator');
  app.listen(port, () => console.log(`orchestrator listening on ${port}`));
  if (process.env.SELF_HEAL) {
    startSelfHealing();
  }
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3002);
}
