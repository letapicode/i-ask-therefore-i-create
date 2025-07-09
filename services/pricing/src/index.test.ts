import request from 'supertest';
import { app } from './index';
import fs from 'fs';
import path from 'path';

const CACHE = path.join(__dirname, '..', '.cache.json');

afterEach(() => {
  if (fs.existsSync(CACHE)) fs.unlinkSync(CACHE);
});

test('estimates cost for provider and region', async () => {
  const res = await request(app).get('/estimate').query({
    provider: 'aws',
    region: 'us-east-1',
    cpu: 10,
    memory: 20,
  });
  expect(res.body.cost).toBeGreaterThan(0);
});

test('recommends cheapest option', async () => {
  const res = await request(app).get('/recommend').query({
    cpu: 5,
    memory: 5,
  });
  expect(res.body.recommendation.provider).toBeDefined();
});
