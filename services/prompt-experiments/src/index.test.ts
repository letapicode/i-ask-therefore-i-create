import request from 'supertest';
import fs from 'fs';

const DB = '.test-prompt-experiments.json';
process.env.EXPERIMENT_DB = DB;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { app } = require('./index');

beforeEach(() => {
  if (fs.existsSync(DB)) fs.unlinkSync(DB);
});

afterEach(() => {
  if (fs.existsSync(DB)) fs.unlinkSync(DB);
});

test('create, update and delete experiment', async () => {
  const create = await request(app)
    .post('/experiments')
    .send({
      name: '<b>test</b>',
      variants: { A: { prompt: '<i>a</i>' }, B: { prompt: 'b' } },
    });
  expect(create.status).toBe(201);
  const id = create.body.id;
  // ensure sanitization
  expect(create.body.name).toBe('&lt;b&gt;test&lt;&#x2F;b&gt;');
  expect(create.body.variants.A.prompt).toBe('&lt;i&gt;a&lt;&#x2F;i&gt;');

  await request(app)
    .put(`/experiments/${id}`)
    .send({ variant: 'A', success: true });
  const fetchExp = await request(app).get(`/experiments/${id}`);
  expect(fetchExp.body.variants.A.success).toBe(1);

  const summary = await request(app).get(`/experiments/${id}/summary`);
  expect(summary.body.variants.A.rate).toBe(1);
  expect(summary.body.best).toBe('A');

  const exportRes = await request(app).get(`/experiments/${id}/export`);
  expect(exportRes.status).toBe(200);
  expect(exportRes.headers['content-type']).toMatch(/text\/csv/);
  expect(exportRes.text).toContain('variant,prompt,success,total,rate');
  expect(exportRes.text).toContain('A,"&lt;i&gt;a&lt;&#x2F;i&gt;",1,1,1');

  const del = await request(app).delete(`/experiments/${id}`);
  expect(del.status).toBe(200);
});

test('rejects invalid variant and winner', async () => {
  const create = await request(app)
    .post('/experiments')
    .send({
      name: 'test',
      variants: { A: { prompt: 'a' } },
    });
  const id = create.body.id;

  const badVariant = await request(app)
    .put(`/experiments/${id}`)
    .send({ variant: 'B', success: true });
  expect(badVariant.status).toBe(400);

  const badWinner = await request(app)
    .put(`/experiments/${id}`)
    .send({ winner: 'B' });
  expect(badWinner.status).toBe(400);

  const fetchExp = await request(app).get(`/experiments/${id}`);
  expect(fetchExp.body.variants.A.total).toBe(0);
  expect(fetchExp.body.winner).toBeUndefined();
});

test('adds new variants with sanitization', async () => {
  const create = await request(app)
    .post('/experiments')
    .send({ name: 'test', variants: { A: { prompt: 'a' } } });
  const id = create.body.id;

  const add = await request(app)
    .post(`/experiments/${id}/variants`)
    .send({ name: 'B', prompt: '<b>b</b>' });
  expect(add.status).toBe(201);
  expect(add.body.prompt).toBe('&lt;b&gt;b&lt;&#x2F;b&gt;');

  const fetchExp = await request(app).get(`/experiments/${id}`);
  expect(fetchExp.body.variants.B.prompt).toBe('&lt;b&gt;b&lt;&#x2F;b&gt;');

  const dup = await request(app)
    .post(`/experiments/${id}/variants`)
    .send({ name: 'B', prompt: 'other' });
  expect(dup.status).toBe(400);
});

test('returns summaries for all experiments', async () => {
  const create = await request(app)
    .post('/experiments')
    .send({ name: 'sum', variants: { A: { prompt: 'a' } } });
  const id = create.body.id;
  await request(app)
    .put(`/experiments/${id}`)
    .send({ variant: 'A', success: true });

  const summaries = await request(app).get('/experiments/summary');
  expect(summaries.status).toBe(200);
  expect(summaries.body).toHaveLength(1);
  expect(summaries.body[0].best).toBe('A');
  expect(summaries.body[0].variants.A.rate).toBe(1);
});

test('deletes variant and clears winner', async () => {
  const create = await request(app)
    .post('/experiments')
    .send({ name: 'del', variants: { A: { prompt: 'a' }, B: { prompt: 'b' } } });
  const id = create.body.id;

  await request(app)
    .put(`/experiments/${id}`)
    .send({ winner: 'B' });

  const del = await request(app).delete(
    `/experiments/${id}/variants/B`
  );
  expect(del.status).toBe(200);

  const fetchExp = await request(app).get(`/experiments/${id}`);
  expect(fetchExp.body.variants.B).toBeUndefined();
  expect(fetchExp.body.winner).toBeUndefined();
});

test('updates variant prompt with sanitization', async () => {
  const create = await request(app)
    .post('/experiments')
    .send({ name: 'upd', variants: { A: { prompt: 'a' } } });
  const id = create.body.id;

  const update = await request(app)
    .put(`/experiments/${id}/variants/A`)
    .send({ prompt: '<b>c</b>' });
  expect(update.status).toBe(200);
  expect(update.body.prompt).toBe('&lt;b&gt;c&lt;&#x2F;b&gt;');

  const fetchExp = await request(app).get(`/experiments/${id}`);
  expect(fetchExp.body.variants.A.prompt).toBe('&lt;b&gt;c&lt;&#x2F;b&gt;');
});

test('resets experiment metrics and clears winner', async () => {
  const create = await request(app)
    .post('/experiments')
    .send({ name: 'reset', variants: { A: { prompt: 'a' } } });
  const id = create.body.id;

  await request(app)
    .put(`/experiments/${id}`)
    .send({ variant: 'A', success: true });
  await request(app)
    .put(`/experiments/${id}`)
    .send({ winner: 'A' });

  const reset = await request(app).post(`/experiments/${id}/reset`);
  expect(reset.status).toBe(200);
  expect(reset.body.winner).toBeUndefined();
  expect(reset.body.variants.A.success).toBe(0);
  expect(reset.body.variants.A.total).toBe(0);
});

test('renames experiment with sanitization', async () => {
  const create = await request(app)
    .post('/experiments')
    .send({ name: 'old', variants: { A: { prompt: 'a' } } });
  const id = create.body.id;

  const rename = await request(app)
    .put(`/experiments/${id}/name`)
    .send({ name: '<b>new</b>' });
  expect(rename.status).toBe(200);
  expect(rename.body.name).toBe('&lt;b&gt;new&lt;&#x2F;b&gt;');

  const fetchExp = await request(app).get(`/experiments/${id}`);
  expect(fetchExp.body.name).toBe('&lt;b&gt;new&lt;&#x2F;b&gt;');
});
