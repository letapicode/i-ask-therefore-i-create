import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { app, generateData } from './index';

const TEMPLATE_DIR = path.join(__dirname, '..', '..', 'packages', 'codegen-templates', 'data-templates');
const TEST_SCHEMA = path.join(TEMPLATE_DIR, 'test.json');

beforeAll(() => {
  if (!fs.existsSync(TEMPLATE_DIR)) fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
  fs.writeFileSync(TEST_SCHEMA, JSON.stringify({ fields: [{ name: 'id', type: 'uuid' }] }));
});

afterAll(() => {
  fs.unlinkSync(TEST_SCHEMA);
});

test('generateData creates records', () => {
  const list = generateData('test', 2);
  expect(list.length).toBe(2);
  expect(list[0]).toHaveProperty('id');
});

test('POST /generate returns records', async () => {
  const res = await request(app).post('/generate').send({ template: 'test', count: 1 });
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBe(1);
});
