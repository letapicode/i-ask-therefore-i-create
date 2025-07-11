import request from 'supertest';
import fs from 'fs';
import { app } from './index';

const DB = '.test-a11y.json';
process.env.A11Y_DB = DB;

beforeEach(() => {
  if (fs.existsSync(DB)) fs.unlinkSync(DB);
});

afterEach(() => {
  if (fs.existsSync(DB)) fs.unlinkSync(DB);
});

test('records history and returns tips', async () => {
  const violations = [{ id: 'color-contrast', help: 'Improve contrast' }];
  const rec = await request(app).post('/history').send({ project: 'demo', violations });
  expect(rec.status).toBe(201);
  const res = await request(app).get('/tips').query({ project: 'demo' });
  expect(res.body.tips[0].id).toBe('color-contrast');
});
