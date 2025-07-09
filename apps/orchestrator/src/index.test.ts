const request = require('supertest');
const { app } = require('./index');
const fs = require('fs');
const path = require('path');

jest.mock('@aws-sdk/client-cloudwatch', () => ({
  CloudWatchClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(async () => ({
      Datapoints: [{ Average: 40, Timestamp: new Date() }],
    })),
  })),
  GetMetricStatisticsCommand: jest.fn(),
}));

jest.mock('node-fetch', () =>
  jest.fn(async (url) => {
    if (url.includes('/metrics')) {
      return { ok: true, json: async () => ({ count: 2 }) };
    }
    return { ok: true, json: async () => ({}) };
  })
);

const jobMem: Record<string, any> = {};
const connMem: Record<string, any> = {};
const pluginMem: Record<string, any> = {};
const tenantMem: Record<string, any> = {};
jest.mock('../../packages/shared/src/dynamo', () => ({
  putItem: jest.fn(async (t: string, item: any) => {
    if (t === 'connectors') connMem[item.tenantId] = item;
    else if (t === 'plugins') pluginMem[item.tenantId] = item;
    else if (t === 'tenants') tenantMem[item.id] = item;
    else jobMem[item.id] = item;
  }),
  getItem: jest.fn(async (t: string, key: any) => {
    if (t === 'connectors') return connMem[key.tenantId];
    if (t === 'plugins') return pluginMem[key.tenantId];
    if (t === 'tenants') return tenantMem[key.id];
    return jobMem[key.id];
  }),
  scanTable: jest.fn(async (t: string) => {
    if (t === 'connectors') return Object.values(connMem);
    if (t === 'plugins') return Object.values(pluginMem);
    if (t === 'tenants') return Object.values(tenantMem);
    return Object.values(jobMem);
  }),
  deleteItem: jest.fn(async (t: string, key: any) => {
    if (t === 'connectors') delete connMem[key.tenantId];
    else if (t === 'plugins') delete pluginMem[key.tenantId];
    else if (t === 'tenants') delete tenantMem[key.id];
    else delete jobMem[key.id];
  }),
}));

afterEach(() => {
  for (const key of Object.keys(jobMem)) delete jobMem[key];
  for (const key of Object.keys(connMem)) delete connMem[key];
  for (const key of Object.keys(pluginMem)) delete pluginMem[key];
  for (const key of Object.keys(tenantMem)) delete tenantMem[key];
});

test('status endpoint returns 404 for missing job', async () => {
  const res = await request(app)
    .get('/api/status/unknown')
    .set('x-tenant-id', 't1');
  expect(res.status).toBe(404);
});

test('cannot access job from another tenant', async () => {
  jobMem['job1'] = {
    id: 'job1',
    tenantId: 't1',
    provider: 'aws',
    description: 'a',
    language: 'node',
    status: 'complete',
  };
  const res = await request(app)
    .get('/api/status/job1')
    .set('x-tenant-id', 't2');
  expect(res.status).toBe(404);
});

test('lists only tenant jobs', async () => {
  jobMem['j1'] = {
    id: 'j1',
    tenantId: 't1',
    provider: 'aws',
    description: 'a',
    language: 'node',
    status: 'complete',
  };
  jobMem['j2'] = {
    id: 'j2',
    tenantId: 't2',
    provider: 'aws',
    description: 'b',
    language: 'node',
    status: 'complete',
  };
  const res = await request(app).get('/api/apps').set('x-tenant-id', 't1');
  expect(res.body).toHaveLength(1);
  expect(res.body[0].id).toBe('j1');
});

test('createApp forwards language', async () => {
  const res = await request(app)
    .post('/api/createApp')
    .set('x-tenant-id', 't1')
    .send({ description: 'test', language: 'go' });
  expect(res.status).toBe(202);
  const job = jobMem[Object.keys(jobMem)[0]];
  expect(job.language).toBe('go');
  expect(job.provider).toBe('aws');
});

test('provider selection uses tenant table', async () => {
  tenantMem['t2'] = { id: 't2', provider: 'gcp' };
  const res = await request(app)
    .post('/api/createApp')
    .set('x-tenant-id', 't2')
    .send({ description: 'cloud' });
  expect(res.status).toBe(202);
  const job = jobMem[Object.keys(jobMem)[0]];
  expect(job.provider).toBe('gcp');
});

test('schema endpoints persist data', async () => {
  await request(app)
    .post('/api/schema')
    .send({ tables: [{ name: 't' }] });
  const res = await request(app).get('/api/schema');
  expect(res.body.tables[0].name).toBe('t');
});

test('connectors API stores and retrieves config', async () => {
  await request(app).post('/api/connectors').set('x-tenant-id', 't1').send({
    stripeKey: 'sk',
    slackKey: 'sl',
    shopifyKey: 'sh',
    quickbooksKey: 'qb',
    zendeskKey: 'zd',
  });
  const res = await request(app)
    .get('/api/connectors')
    .set('x-tenant-id', 't1');
  expect(res.body.stripeKey).toBe('sk');
  expect(res.body.slackKey).toBe('sl');
  expect(res.body.shopifyKey).toBe('sh');
  expect(res.body.quickbooksKey).toBe('qb');
  expect(res.body.zendeskKey).toBe('zd');
});

test('connectors DELETE removes type', async () => {
  await request(app).post('/api/connectors').set('x-tenant-id', 't1').send({
    stripeKey: 'sk',
    slackKey: 'sl',
    shopifyKey: 'sh',
    quickbooksKey: 'qb',
    zendeskKey: 'zd',
  });
  await request(app).delete('/api/connectors/stripe').set('x-tenant-id', 't1');
  const res = await request(app)
    .get('/api/connectors')
    .set('x-tenant-id', 't1');
  expect(res.body.stripeKey).toBeUndefined();
  expect(res.body.slackKey).toBe('sl');
  expect(res.body.shopifyKey).toBe('sh');
  expect(res.body.quickbooksKey).toBe('qb');
  expect(res.body.zendeskKey).toBe('zd');
});

test('plugins API installs and removes plugin', async () => {
  await request(app)
    .post('/api/plugins')
    .set('x-tenant-id', 't1')
    .send({ name: 'auth' });
  let res = await request(app).get('/api/plugins').set('x-tenant-id', 't1');
  expect(res.body).toContain('auth');
  await request(app).delete('/api/plugins/auth').set('x-tenant-id', 't1');
  res = await request(app).get('/api/plugins').set('x-tenant-id', 't1');
  expect(res.body).not.toContain('auth');
});

test('costForecast returns projected values', async () => {
  const res = await request(app).get('/api/costForecast');
  expect(res.body.events).toBe(2);
  expect(res.body.cpuForecast).toBeGreaterThan(0);
  expect(res.body.costForecast).toBeGreaterThan(0);
});

import WebSocket from 'ws';

test('chat websocket responds', (done) => {
  const server = require('./index').start(0);
  const address = (server.address() as any).port;
  const ws = new WebSocket(`ws://localhost:${address}/chat`);
  ws.on('open', () => ws.send('hi'));
  ws.on('message', (msg) => {
    expect(typeof msg).toBe('string');
    ws.close();
    server.close();
    done();
  });
});
