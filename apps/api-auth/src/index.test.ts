import request from 'supertest';
import { app } from './index';

jest.mock('../../packages/shared/src/dynamo', () => ({
  putItem: jest.fn(),
  getItem: jest.fn(),
  updateItem: jest.fn(),
}));

const dynamo = require('../../packages/shared/src/dynamo');

test('signup missing fields returns 400', async () => {
  const res = await request(app).post('/signup').send({});
  expect(res.status).toBe(400);
});

test('request password reset validates email', async () => {
  const res = await request(app).post('/requestPasswordReset').send({});
  expect(res.status).toBe(400);
});

test('change email validates fields', async () => {
  const res = await request(app).post('/changeEmail').send({});
  expect(res.status).toBe(400);
});
