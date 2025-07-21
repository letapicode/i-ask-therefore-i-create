import request from 'supertest';
import fs from 'fs';
import { app } from './index';

const DB = '.test-prompt-experiments.json';
process.env.EXPERIMENT_DB = DB;

beforeEach(() => {
  if (fs.existsSync(DB)) fs.unlinkSync(DB);
});

afterEach(() => {
  if (fs.existsSync(DB)) fs.unlinkSync(DB);
});

test('create, update and delete experiment', async () => {
  const create = await request(app)
    .post('/experiments')
    .send({ name: 'test', variants: { A: { prompt: 'a' }, B: { prompt: 'b' } } });
  expect(create.status).toBe(201);
  const id = create.body.id;

  await request(app)
    .put(`/experiments/${id}`)
    .send({ variant: 'A', success: true });
  const fetchExp = await request(app).get(`/experiments/${id}`);
  expect(fetchExp.body.variants.A.success).toBe(1);

  const del = await request(app).delete(`/experiments/${id}`);
  expect(del.status).toBe(200);
});
