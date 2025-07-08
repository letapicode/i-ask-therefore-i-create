import request from 'supertest';
import { app } from './index';
import fs from 'fs';

const SUBS_DB = '.test-subs.json';
const INV_DB = '.test-invoices.json';
process.env.SUBS_DB = SUBS_DB;
process.env.INVOICE_DB = INV_DB;

afterEach(() => {
  if (fs.existsSync(SUBS_DB)) fs.unlinkSync(SUBS_DB);
  if (fs.existsSync(INV_DB)) fs.unlinkSync(INV_DB);
});

test('creates subscription and invoice', async () => {
  const res = await request(app)
    .post('/subscribe')
    .send({ email: 'a@test.com', plan: 'pro' });
  expect(res.status).toBe(201);
  const subs = JSON.parse(fs.readFileSync(SUBS_DB, 'utf-8'));
  const inv = JSON.parse(fs.readFileSync(INV_DB, 'utf-8'));
  expect(subs.length).toBe(1);
  expect(inv.length).toBe(1);
});
