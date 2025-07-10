import request from 'supertest';
import fs from 'fs';
import { app } from './index';

const LEDGER = '.test-ledger.json';
const META = '.test-plugin-meta.json';
process.env.BLOCKCHAIN_LEDGER = LEDGER;
process.env.PLUGINS_DB = META;

beforeEach(() => {
  if (fs.existsSync(LEDGER)) fs.unlinkSync(LEDGER);
  if (fs.existsSync(META)) fs.unlinkSync(META);
});

afterEach(() => {
  if (fs.existsSync(LEDGER)) fs.unlinkSync(LEDGER);
  if (fs.existsSync(META)) fs.unlinkSync(META);
});

test('purchase, install and rate plugin', async () => {
  const purchase = await request(app)
    .post('/purchase')
    .send({ name: 'auth', buyer: '0xabc' });
  expect(purchase.status).toBe(201);
  const key = purchase.body.licenseKey;
  const install = await request(app)
    .post('/install')
    .send({ name: 'auth', licenseKey: key });
  expect(install.status).toBe(201);
  await request(app).post('/rate').send({ name: 'auth', value: 5 });
  const res = await request(app).get('/stats');
  expect(res.body[0].name).toBe('auth');
  expect(res.body[0].installs).toBeGreaterThanOrEqual(1);
  expect(res.body[0].ratings[0]).toBe(5);
});
