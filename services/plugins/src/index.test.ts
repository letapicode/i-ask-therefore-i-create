import request from 'supertest';
import fs from 'fs';
import { app } from './index';

const LEDGER = '.test-ledger.json';
const META = '.test-plugin-meta.json';
const LIST = '.test-resale.json';
process.env.BLOCKCHAIN_LEDGER = LEDGER;
process.env.PLUGINS_DB = META;
process.env.PLUGIN_LISTINGS = LIST;

beforeEach(() => {
  if (fs.existsSync(LEDGER)) fs.unlinkSync(LEDGER);
  if (fs.existsSync(META)) fs.unlinkSync(META);
  if (fs.existsSync(LIST)) fs.unlinkSync(LIST);
});

afterEach(() => {
  if (fs.existsSync(LEDGER)) fs.unlinkSync(LEDGER);
  if (fs.existsSync(META)) fs.unlinkSync(META);
  if (fs.existsSync(LIST)) fs.unlinkSync(LIST);
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

test('list and purchase resale license', async () => {
  const purchase = await request(app)
    .post('/purchase')
    .send({ name: 'auth', buyer: '0xabc' });
  const key = purchase.body.licenseKey;
  await request(app)
    .post('/listings')
    .send({ plugin: 'auth', licenseKey: key, price: 1, seller: '0xabc' });
  const list = await request(app).get('/listings');
  expect(list.body.length).toBe(1);
  const buy = await request(app)
    .post('/purchase-listing')
    .send({ plugin: 'auth', licenseKey: key, buyer: '0xdef' });
  expect(buy.status).toBe(201);
  const list2 = await request(app).get('/listings');
  expect(list2.body.length).toBe(0);
});
