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
    .send({ name: '<b>test</b>', variants: { A: { prompt: '<i>a</i>' }, B: { prompt: 'b' } } });
  expect(create.status).toBe(201);
  const id = create.body.id;
  // ensure sanitization
  expect(create.body.name).toBe('&lt;b&gt;test&lt;/b&gt;');
  expect(create.body.variants.A.prompt).toBe('&lt;i&gt;a&lt;/i&gt;');

  await request(app)
    .put(`/experiments/${id}`)
    .send({ variant: 'A', success: true });
  const fetchExp = await request(app).get(`/experiments/${id}`);
  expect(fetchExp.body.variants.A.success).toBe(1);

  const summary = await request(app).get(`/experiments/${id}/summary`);
  expect(summary.body.variants.A.rate).toBe(1);
  expect(summary.body.best).toBe('A');

  const del = await request(app).delete(`/experiments/${id}`);
  expect(del.status).toBe(200);
});
