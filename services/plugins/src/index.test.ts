import request from 'supertest';
import fs from 'fs';

let app: any;

beforeEach(() => {
  process.env.PLUGINS_DB = '.test-meta.json';
  if (fs.existsSync('.test-meta.json')) fs.unlinkSync('.test-meta.json');
  jest.resetModules();
  app = require('./index').app;
});

afterEach(() => {
  if (fs.existsSync('.test-meta.json')) fs.unlinkSync('.test-meta.json');
});

test('records installs and ratings', async () => {
  await request(app).post('/install').send({ name: 'auth' });
  await request(app).post('/rate').send({ name: 'auth', value: 5 });
  const res = await request(app).get('/stats');
  expect(res.body[0].name).toBe('auth');
  expect(res.body[0].installs).toBe(1);
  expect(res.body[0].ratings[0]).toBe(5);
});
