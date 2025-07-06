import { scanTable } from '../../packages/shared/src/dynamo';
import type { Job } from './index';

let dispatch: (job: Job) => Promise<void>;

export function configure(fn: (job: Job) => Promise<void>) {
  dispatch = fn;
}

const JOBS_TABLE = process.env.JOBS_TABLE || 'jobs';

export async function healFailures() {
  const jobs = await scanTable<Job>(JOBS_TABLE);
  for (const job of jobs) {
    if (job.status === 'failed') {
      console.log('retrying failed job', job.id);
      dispatch({ ...job, status: 'queued' });
    }
  }
}

export function startSelfHealing(intervalMs = 60000) {
  setInterval(() => {
    healFailures().catch(err => console.error('self-heal error', err));
  }, intervalMs);
}
