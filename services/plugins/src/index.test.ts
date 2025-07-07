import request from 'supertest';
import { app } from './index';

test('records installs and ratings', async () => {
  await request(app).post('/install').send({ name: 'auth' });
  await request(app).post('/rate').send({ name: 'auth', value: 5 });
  const res = await request(app).get('/stats');
  expect(res.body[0].name).toBe('auth');
  expect(res.body[0].installs).toBe(1);
  expect(res.body[0].ratings[0]).toBe(5);
});
