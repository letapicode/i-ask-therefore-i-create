import request from 'supertest';
import { app } from './index';

test('status endpoint returns 404 for missing job', async () => {
  const res = await request(app).get('/api/status/unknown');
  expect(res.status).toBe(404);
});
