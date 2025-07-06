const request = require('supertest');
const { app } = require('./index');

jest.mock('node-fetch', () => jest.fn(async () => ({ ok: true, json: async () => ({}) })));

test('status endpoint returns 404 for missing job', async () => {
  const res = await request(app).get('/api/status/unknown');
  expect(res.status).toBe(404);
});
