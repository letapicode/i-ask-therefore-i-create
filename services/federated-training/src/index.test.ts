process.env.DP_NOISE = '0';
import request from 'supertest';
import { app } from './index';
import fs from 'fs';

afterEach(() => {
  for (const f of ['.updates.json', '.model.json', '.optin.json']) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
});

test('aggregates updates when opted in', async () => {
  await request(app).post('/optIn').send({ tenantId: 't1' });
  await request(app)
    .post('/update')
    .send({ tenantId: 't1', weights: [1, 2] });
  const res = await request(app).get('/model');
  expect(res.status).toBe(200);
  expect(res.body).toEqual([1, 2]);
});
