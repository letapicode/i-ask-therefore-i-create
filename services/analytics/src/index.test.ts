import request from 'supertest';
import { app } from './index';

test('metrics endpoint returns count', async () => {
  const res = await request(app).get('/metrics');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('count');
});
