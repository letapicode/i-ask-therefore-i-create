import request from 'supertest';
// enable business tips route for tests
process.env.ENABLE_BUSINESS_TIPS = 'true';
// load app after setting env var
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { app } = require('./index');

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

test('business tips endpoint returns suggestions', async () => {
  const res = await request(app).get('/businessTips');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('tips');
});
