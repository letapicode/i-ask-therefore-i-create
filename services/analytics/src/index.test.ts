import request from 'supertest';
import { app } from './index';

test('metrics endpoint returns count', async () => {
  const res = await request(app).get('/metrics');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('count');
});

test('create and fetch experiment', async () => {
  await request(app)
    .post('/experiments')
    .send({ id: 'exp1', variant: 'A', metric: 10 });
  const res = await request(app).get('/experiments/exp1');
  expect(res.status).toBe(200);
  expect(res.body.variant).toBe('A');
});

test('ui events produce suggestions', async () => {
  await request(app)
    .post('/uiEvent')
    .send({ page: '/signup', element: 'submit', action: 'click' });
  const res = await request(app).get('/uxSuggestions');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0]).toHaveProperty('text');
});

test('aggregates security reports', async () => {
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, '../security/testproj');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'audit.json'),
    JSON.stringify({ vulnerabilities: { a: {}, b: {} } })
  );
  const res = await request(app).get('/securityReports');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0]).toHaveProperty('vulnerabilities');
  fs.rmSync(path.join(__dirname, '../security'), {
    recursive: true,
    force: true,
  });
});

test('chat history persists', async () => {
  await request(app).post('/chat').send({ role: 'user', content: 'hi' });
  const res = await request(app).get('/chat');
  expect(res.body.pop().content).toBe('hi');
});

test('business tips endpoint returns tips', async () => {
  for (let i = 0; i < 5; i++) {
    await request(app)
      .post('/events')
      .send({ type: 'trialStart', userId: `u${i}` });
  }
  const res = await request(app).get('/businessTips');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.tips)).toBe(true);
  expect(
    res.body.tips.includes(
      'Offer incentives like discounts to convert trial users.'
    )
  ).toBe(true);
});

test('stores and retrieves AR session events', async () => {
  await request(app)
    .post('/arSessions/s1')
    .send({ action: 'add', item: { x: 1 } });
  const res = await request(app).get('/arSessions/s1');
  expect(res.status).toBe(200);
  expect(res.body.events[0].item.x).toBe(1);
  const list = await request(app).get('/arSessions');
  expect(list.body.sessions).toContain('s1');
});

test('records accessibility scores', async () => {
  await request(app)
    .post('/a11yScore')
    .send({ project: 'demo', score: 95 });
  const res = await request(app).get('/a11yScore?project=demo');
  expect(res.status).toBe(200);
  expect(res.body.pop().score).toBe(95);
});

test('stores chat context', async () => {
  const res = await request(app)
    .post('/chatContext')
    .send({ user: 'u1', jobId: '321' });
  expect(res.status).toBe(201);
  const ctx = await request(app).get('/chatContext?user=u1');
  expect(ctx.body.jobId).toBe('321');
});
