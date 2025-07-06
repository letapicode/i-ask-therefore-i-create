import express from 'express';
import { randomUUID } from 'crypto';
import fetch from 'node-fetch';
import { putItem, getItem, scanTable } from '../../packages/shared/src/dynamo';
import { uploadObject } from '../../packages/shared/src/s3';
import { sendEmail } from '../../services/email/src';
import { initSentry } from '../../packages/shared/src/sentry';

export const app = express();
app.use(express.json());

const JOBS_TABLE = process.env.JOBS_TABLE || 'jobs';
const CODEGEN_URL = process.env.CODEGEN_URL || 'http://localhost:3003/generate';
const DEPLOY_URL = process.env.DEPLOY_URL;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
const ARTIFACTS_BUCKET = process.env.ARTIFACTS_BUCKET;
const TENANT_HEADER = 'x-tenant-id';

interface Job {
  id: string;
  tenantId: string;
  description: string;
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

async function dispatchJob(job: Job) {
  try {
    await putItem(JOBS_TABLE, { ...job, status: 'running' });
    if (NOTIFY_EMAIL) {
      sendEmail({ template: 'job-start', to: NOTIFY_EMAIL, data: { id: job.id } });
    }
    const genRes = await fetch(CODEGEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, description: job.description })
    });
    const { code } = await genRes.json();
    if (ARTIFACTS_BUCKET && code) {
      await uploadObject(ARTIFACTS_BUCKET, `${job.id}.txt`, code);
    }
    await putItem(JOBS_TABLE, { ...job, status: 'complete' });
    await triggerDeploy(job.id);
    if (NOTIFY_EMAIL) {
      sendEmail({ template: 'job-complete', to: NOTIFY_EMAIL, data: { id: job.id } });
    }
  } catch (err) {
    await putItem(JOBS_TABLE, { ...job, status: 'failed' });
    if (NOTIFY_EMAIL) {
      sendEmail({ template: 'job-failed', to: NOTIFY_EMAIL, data: { id: job.id } });
    }
  }
}

app.post('/api/createApp', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'missing description' });
  const id = randomUUID();
  const job: Job = { id, tenantId, description, status: 'queued' };
  await putItem(JOBS_TABLE, job);
  dispatchJob(job); // fire and forget
  res.status(202).json({ jobId: id });
});

app.get('/api/status/:id', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const job = await getItem<Job>(JOBS_TABLE, { id: req.params.id });
  if (!job || job.tenantId !== tenantId) return res.status(404).json({ error: 'not found' });
  res.json(job);
});

app.get('/api/apps', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const jobs = await scanTable<Job>(JOBS_TABLE);
  res.json(jobs.filter(j => j.tenantId === tenantId));
});

app.post('/api/redeploy/:id', async (req, res) => {
  const tenantId = req.header(TENANT_HEADER);
  if (!tenantId) return res.status(401).json({ error: 'missing tenant' });
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'missing description' });
  const id = req.params.id;
  const job: Job = { id, tenantId, description, status: 'queued' };
  await putItem(JOBS_TABLE, job);
  dispatchJob(job);
  res.status(202).json({ jobId: id });
});

export function start(port = 3002) {
  initSentry('orchestrator');
  app.listen(port, () => console.log(`orchestrator listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3002);
}

