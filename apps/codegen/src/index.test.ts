const request = require('supertest');
jest.mock('node-fetch', () => jest.fn(async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: 'code' } }] }) })));
jest.mock('./openai', () => ({
  generateCode: jest.fn(async () => 'code'),
}));
const { app } = require('./index');
const { generateCode } = require('./openai');

test('generate endpoint validates description', async () => {
  const res = await request(app).post('/generate').send({ jobId: '1' });
  expect(res.status).toBe(500);
});

test('forwards language option', async () => {
  const res = await request(app)
    .post('/generate')
    .send({ jobId: '1', description: 'd', language: 'go' });
  expect(res.status).toBe(200);
  expect(generateCode).toHaveBeenCalledWith({ description: 'd', language: 'go' });
});
