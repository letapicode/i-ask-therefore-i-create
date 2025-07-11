import request from 'supertest';
import fs from 'fs';
import { app } from './index';

const STATS = '.test-query-stats.json';
const RECS = '.test-query-recs.json';

beforeEach(() => {
  process.env.QUERY_STATS_DB = STATS;
  process.env.REC_DB = RECS;
  process.env.SLOW_QUERY_MS = '1';
  if (fs.existsSync(STATS)) fs.unlinkSync(STATS);
  if (fs.existsSync(RECS)) fs.unlinkSync(RECS);
});

afterEach(() => {
  if (fs.existsSync(STATS)) fs.unlinkSync(STATS);
  if (fs.existsSync(RECS)) fs.unlinkSync(RECS);
});

test('creates recommendation from stats', async () => {
  await request(app)
    .post('/stats')
    .send({ appId: 'a1', query: 'SELECT', duration: 5 });
  const res = await request(app).get('/recommendations');
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(1);
  expect(res.body[0]).toHaveProperty('query', 'SELECT');
});

test('apply endpoint marks recommendation', async () => {
  await request(app)
    .post('/stats')
    .send({ appId: 'a1', query: 'SELECT', duration: 5 });
  const recs = await request(app).get('/recommendations');
  const id = recs.body[0].id;
  const res = await request(app).post(`/recommendations/${id}/apply`);
  expect(res.status).toBe(200);
  const final = await request(app).get('/recommendations');
  expect(final.body[0].applied).toBe(true);
});
