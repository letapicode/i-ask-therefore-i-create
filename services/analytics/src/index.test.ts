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
