import request from 'supertest';
import { app } from './index';

test('signup missing fields returns 400', async () => {
  const res = await request(app).post('/signup').send({});
  expect(res.status).toBe(400);
});
