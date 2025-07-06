import request from 'supertest';
import { app } from './index';

test('generate endpoint validates description', async () => {
  const res = await request(app).post('/generate').send({ jobId: '1' });
  expect(res.status).toBe(500);
});
