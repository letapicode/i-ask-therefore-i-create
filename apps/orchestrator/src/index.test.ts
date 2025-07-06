const request = require('supertest');
const { app } = require('./index');

jest.mock('node-fetch', () => jest.fn(async () => ({ ok: true, json: async () => ({}) })));

const memory: Record<string, any> = {};
jest.mock('../../packages/shared/src/dynamo', () => ({
  putItem: jest.fn(async (_t: string, item: any) => { memory[item.id] = item; }),
  getItem: jest.fn(async (_t: string, key: any) => memory[key.id]),
  scanTable: jest.fn(async () => Object.values(memory)),
}));

afterEach(() => {
  for (const key of Object.keys(memory)) delete memory[key];
});

test('status endpoint returns 404 for missing job', async () => {
  const res = await request(app)
    .get('/api/status/unknown')
    .set('x-tenant-id', 't1');
  expect(res.status).toBe(404);
});

test('cannot access job from another tenant', async () => {
  memory['job1'] = { id: 'job1', tenantId: 't1', description: 'a', status: 'complete' };
  const res = await request(app)
    .get('/api/status/job1')
    .set('x-tenant-id', 't2');
  expect(res.status).toBe(404);
});

test('lists only tenant jobs', async () => {
  memory['j1'] = { id: 'j1', tenantId: 't1', description: 'a', status: 'complete' };
  memory['j2'] = { id: 'j2', tenantId: 't2', description: 'b', status: 'complete' };
  const res = await request(app)
    .get('/api/apps')
    .set('x-tenant-id', 't1');
  expect(res.body).toHaveLength(1);
  expect(res.body[0].id).toBe('j1');
});
