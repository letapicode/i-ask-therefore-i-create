import request from 'supertest';
import fs from 'fs';
import { app } from './index';

const DB = '.test-prompts.json';
process.env.PROMPT_DB = DB;

beforeEach(() => {
  if (fs.existsSync(DB)) fs.unlinkSync(DB);
});

afterEach(() => {
  if (fs.existsSync(DB)) fs.unlinkSync(DB);
});

test('create, update and delete prompt', async () => {
  const create = await request(app)
    .post('/prompts')
    .send({ name: 'greet', text: 'hello' });
  expect(create.status).toBe(201);
  const id = create.body.id;

  const update = await request(app)
    .put(`/prompts/${id}`)
    .send({ text: 'hi there' });
  expect(update.status).toBe(200);
  expect(update.body.versions.length).toBe(2);

  const res = await request(app).get(`/prompts/${id}`);
  expect(res.body.versions[1].text).toBe('hi there');

  const del = await request(app).delete(`/prompts/${id}`);
  expect(del.status).toBe(200);
  const notFound = await request(app).get(`/prompts/${id}`);
  expect(notFound.status).toBe(404);
});
