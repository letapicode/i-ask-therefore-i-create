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
    if (url.endsWith('/models')) {
      return { ok: true, json: async () => ['v1'] };
    }
    if (url.includes('/models/')) {
      return { ok: true, json: async () => [0, 1] };
    }
    return { ok: true, json: async () => ({}) };
  })
);
jest.mock(
  '@tensorflow/tfjs',
  () => ({
    tensor: jest.fn(() => ({ dataSync: () => [0] })),
    loadLayersModel: jest.fn(async () => ({
      predict: () => ({ dataSync: () => [0] }),
    })),
  }),
  { virtual: true }
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
jest.mock('../../packages/shared/src/scaling', () => ({
  updateEdgeScaling: jest.fn(async () => {})
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

test('createApp forwards database', async () => {
  const res = await request(app)
    .post('/api/createApp')
    .set('x-tenant-id', 't1')
    .send({ description: 'db', database: 'graph' });
  expect(res.status).toBe(202);
  const job = jobMem[Object.keys(jobMem)[0]];
  expect(job.database).toBe('graph');
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

test('preview flag stores preview info', async () => {
  const res = await request(app)
    .post('/api/createApp')
    .set('x-tenant-id', 't1')
    .send({ description: 'p', preview: true });
  expect(res.status).toBe(202);
  const id = res.body.jobId;
  const status = await request(app)
    .get(`/api/status/${id}`)
    .set('x-tenant-id', 't1');
  expect(status.body.previewUrl).toBeDefined();
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
    kafkaBrokers: 'localhost:9092',
    kafkaTopic: 't',
    kinesisStream: 's',
    kinesisRegion: 'us-east-1',
  });
  const res = await request(app)
    .get('/api/connectors')
    .set('x-tenant-id', 't1');
  expect(res.body.stripeKey).toBe('sk');
  expect(res.body.slackKey).toBe('sl');
  expect(res.body.shopifyKey).toBe('sh');
  expect(res.body.quickbooksKey).toBe('qb');
  expect(res.body.zendeskKey).toBe('zd');
  expect(res.body.kafkaBrokers).toBe('localhost:9092');
  expect(res.body.kafkaTopic).toBe('t');
  expect(res.body.kinesisStream).toBe('s');
  expect(res.body.kinesisRegion).toBe('us-east-1');
});

test('connectors DELETE removes type', async () => {
  await request(app).post('/api/connectors').set('x-tenant-id', 't1').send({
    stripeKey: 'sk',
    slackKey: 'sl',
    shopifyKey: 'sh',
    quickbooksKey: 'qb',
    zendeskKey: 'zd',
    kafkaBrokers: 'localhost:9092',
    kafkaTopic: 't',
    kinesisStream: 's',
    kinesisRegion: 'us-east-1',
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
  expect(res.body.kafkaBrokers).toBe('localhost:9092');
  expect(res.body.kafkaTopic).toBe('t');
  expect(res.body.kinesisStream).toBe('s');
  expect(res.body.kinesisRegion).toBe('us-east-1');
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

test('arSignal broadcasts messages', (done) => {
  const server = require('./index').start(0);
  const port = (server.address() as any).port;
  const a = new WebSocket(`ws://localhost:${port}/arSignal?session=s1`);
  const b = new WebSocket(`ws://localhost:${port}/arSignal?session=s1`);
  b.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.test) {
      a.close();
      b.close();
      server.close();
      done();
    }
  });
  a.on('open', () => {
    a.send(JSON.stringify({ test: true }));
  });
});

test('publishMobile triggers store calls', async () => {
  jobMem['j1'] = {
    id: 'j1',
    tenantId: 't1',
    provider: 'aws',
    description: 'm',
    language: 'node',
    status: 'complete',
    created: Date.now(),
  };
  connMem['t1'] = { tenantId: 't1', config: { appleKey: 'a', googleKey: 'g' } };
  const res = await request(app)
    .post('/api/publishMobile/j1')
    .set('x-tenant-id', 't1');
  expect(res.status).toBe(200);
  expect(fetch).toHaveBeenCalledWith(
    'https://api.appstoreconnect.apple.com/v1/apps',
    expect.any(Object)
  );
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('androidpublisher'),
    expect.any(Object)
  );
});

test('arLayout endpoints store and retrieve layout', async () => {
  const fetchMock = require('node-fetch') as jest.Mock;
  const file = path.resolve('ar-layout.json');
  if (fs.existsSync(file)) fs.unlinkSync(file);
  let res = await request(app).get('/api/arLayout');
  expect(res.body.items).toEqual([]);
  await request(app)
    .post('/api/arLayout')
    .send({ items: [{ x: 1, y: 0, z: -1 }] });
  res = await request(app).get('/api/arLayout');
  expect(res.body.items).toHaveLength(1);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/events'),
    expect.objectContaining({ method: 'POST' })
  );
});

test('modelUpdate forwards to federated service', async () => {
  const fetchMock = require('node-fetch') as jest.Mock;
  const res = await request(app)
    .post('/api/modelUpdate')
    .set('x-tenant-id', 't1')
    .send({ weights: [0.1, 0.2] });
  expect(res.status).toBe(200);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/update'),
    expect.objectContaining({ method: 'POST' })
  );
});

test('a11yReport returns scan results', async () => {
  const file = path.resolve('test.html');
  fs.writeFileSync(file, '<html><img src=""></html>');
  const res = await request(app).post('/api/a11yReport').send({ path: file });
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.violations)).toBe(true);
  fs.unlinkSync(file);
});

test('syntheticData forwards to service', async () => {
  const fetchMock = require('node-fetch') as jest.Mock;
  const res = await request(app)
    .post('/api/syntheticData')
    .send({ template: 'user', count: 1 });
  expect(res.status).toBe(200);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/generate'),
    expect.objectContaining({ method: 'POST' })
  );
});

test('exportData anonymizes PII fields', async () => {
  jobMem['j1'] = {
    id: 'j1',
    tenantId: 't1',
    provider: 'aws',
    description: 'test',
    language: 'node',
    status: 'complete',
    email: 'user@example.com',
  };
  const res = await request(app)
    .get('/api/exportData')
    .set('x-tenant-id', 't1');
  expect(res.status).toBe(200);
  expect(res.body[0].email).toBe('[REDACTED]');
});

test('github webhook stores review results', async () => {
  const fetchMock = require('node-fetch') as jest.Mock;
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ lintErrors: 2, vulnerabilities: 1 }),
  });
  const file = path.resolve('.reviews.json');
  if (fs.existsSync(file)) fs.unlinkSync(file);
  const payload = {
    action: 'opened',
    pull_request: { number: 1 },
    repository: {
      clone_url: 'http://example.com/repo.git',
      full_name: 'org/repo',
    },
  };
  const res = await request(app).post('/github/webhook').send(payload);
  expect(res.status).toBe(200);
  const list = JSON.parse(fs.readFileSync(file, 'utf-8'));
  expect(list[0].lintErrors).toBe(2);
  fs.unlinkSync(file);
});

test('seedData endpoint writes seed file', async () => {
  jobMem['s1'] = {
    id: 's1',
    tenantId: 't1',
    provider: 'aws',
    description: 'demo',
    language: 'node',
    status: 'complete',
    created: Date.now(),
  };
  const schema = {
    tables: [{ name: 't', columns: [{ name: 'id', type: 'uuid' }] }],
  };
  fs.writeFileSync('schema.json', JSON.stringify(schema));
  const dir = 'seeds';
  const file = path.join(dir, 's1.json');
  if (fs.existsSync(file)) fs.unlinkSync(file);
  const fetchMock = require('node-fetch') as jest.Mock;
  fetchMock.mockResolvedValueOnce({
    json: async () => ({ choices: [{ message: { content: '[{"id":1}]' } }] }),
  });
  const res = await request(app)
    .post('/api/seedData/s1')
    .set('x-tenant-id', 't1')
    .send({ rows: 1 });
  expect(res.status).toBe(200);
  expect(fs.existsSync(file)).toBe(true);
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  expect(data).toHaveLength(1);
  fs.unlinkSync(file);
  fs.unlinkSync('schema.json');
});

test('community models endpoints', async () => {
  const listRes = await request(app).get('/api/communityModels');
  expect(listRes.status).toBe(200);
  expect(listRes.body.versions).toEqual(['v1']);

  const res = await request(app)
    .post('/api/communityModels')
    .send({ version: 'v1' });
  expect(res.status).toBe(200);
  expect(fs.existsSync('.community-model.json')).toBe(true);
  const data = JSON.parse(fs.readFileSync('.community-model.json', 'utf-8'));
  expect(data.version).toBe('v1');
});

test('edge scaling endpoint validates input', async () => {
  const res = await request(app).post('/api/edgeScaling').send({});
  expect(res.status).toBe(400);
});

test('edge scaling triggers update', async () => {
  const { updateEdgeScaling } = require('../../packages/shared/src/scaling');
  updateEdgeScaling.mockResolvedValueOnce();
  const res = await request(app)
    .post('/api/edgeScaling')
    .send({ functionName: 'fn', version: '1', min: 1, max: 2 });
  expect(res.status).toBe(201);
  expect(updateEdgeScaling).toHaveBeenCalled();
});

test('variant reset proxies to experiment service', async () => {
  const res = await request(app)
    .post('/api/experiments/e1/variants/A/reset')
    .set('x-tenant-id', 't1');
  expect(res.status).toBe(200);
});
