const request = require('supertest');
jest.mock('node-fetch', () => jest.fn(async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: 'code' } }] }) })));
const { app } = require('./index');

test('generate endpoint validates description', async () => {
  const res = await request(app).post('/generate').send({ jobId: '1' });
  expect(res.status).toBe(500);
});
