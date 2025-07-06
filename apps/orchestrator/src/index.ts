import express from 'express';
import { randomUUID } from 'crypto';
import fetch from 'node-fetch';
import { putItem, getItem } from '../../packages/shared/src/dynamo';
import { initSentry } from '../../packages/shared/src/sentry';

const app = express();
app.use(express.json());

const JOBS_TABLE = process.env.JOBS_TABLE || 'jobs';
const CODEGEN_URL = process.env.CODEGEN_URL || 'http://localhost:3002/generate';

interface Job {
  id: string;
  description: string;
  status: 'queued' | 'running' | 'complete' | 'failed';
}

async function dispatchJob(job: Job) {
  try {
    await putItem(JOBS_TABLE, { ...job, status: 'running' });
    await fetch(CODEGEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, description: job.description })
    });
    await putItem(JOBS_TABLE, { ...job, status: 'complete' });
  } catch (err) {
    await putItem(JOBS_TABLE, { ...job, status: 'failed' });
  }
}

app.post('/api/createApp', async (req, res) => {
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'missing description' });
  const id = randomUUID();
  const job: Job = { id, description, status: 'queued' };
  await putItem(JOBS_TABLE, job);
  dispatchJob(job); // fire and forget
  res.status(202).json({ jobId: id });
});

app.get('/api/status/:id', async (req, res) => {
  const job = await getItem<Job>(JOBS_TABLE, { id: req.params.id });
  if (!job) return res.status(404).json({ error: 'not found' });
  res.json(job);
});

export function start(port = 3002) {
  initSentry('orchestrator');
  app.listen(port, () => console.log(`orchestrator listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3002);
}
