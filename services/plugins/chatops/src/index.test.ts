import request from 'supertest';
import fs from 'fs';
import fetch from 'node-fetch';

const CONTEXT = '.test-chatops.json';
process.env.CHATOPS_CONTEXT = CONTEXT;
process.env.ORCH_URL = 'http://orch';
process.env.ANALYTICS_URL = '';
const { app } = require('./index');

jest.mock('node-fetch', () =>
  jest.fn(async () => ({ json: async () => ({ status: 'running' }) }))
);
const fetchMock = fetch as unknown as jest.Mock;

beforeEach(() => {
  if (fs.existsSync(CONTEXT)) fs.unlinkSync(CONTEXT);
  fetchMock.mockClear();
});

afterEach(() => {
  if (fs.existsSync(CONTEXT)) fs.unlinkSync(CONTEXT);
});

test('status command returns job status and saves context', async () => {
  const res = await request(app)
    .post('/slack')
    .send('user_id=u1&text=status%20123')
    .set('Content-Type', 'application/x-www-form-urlencoded');
  expect(res.body.text).toContain('running');
  expect(fetchMock).toHaveBeenCalledWith(
    'http://orch/api/status/123',
    expect.objectContaining({ headers: { 'x-tenant-id': 'chatops' } })
  );
  const ctx = JSON.parse(fs.readFileSync(CONTEXT, 'utf-8'));
  expect(ctx.u1).toBe('123');
});

test('redeploy command triggers orchestrator', async () => {
  const res = await request(app)
    .post('/slack')
    .send('user_id=u2&text=redeploy%20456')
    .set('Content-Type', 'application/x-www-form-urlencoded');
  expect(fetchMock).toHaveBeenCalledWith(
    'http://orch/api/redeploy/456',
    expect.objectContaining({ method: 'POST' })
  );
  expect(res.body.text).toContain('Redeploy triggered');
});

test('nlp endpoint parses text and updates context', async () => {
  const res = await request(app)
    .post('/api/chatops/nlp')
    .send({ user: 'u3', text: 'what is the status of job 789?' });
  expect(res.body.intent).toBe('status');
  expect(res.body.jobId).toBe('789');
  const ctx = JSON.parse(fs.readFileSync(CONTEXT, 'utf-8'));
  expect(ctx.u3).toBe('789');
});
