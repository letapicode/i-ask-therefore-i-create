import request from 'supertest';
import { app } from '../../apps/orchestrator/src/index';

jest.mock('node-fetch', () => () => Promise.resolve({ json: async () => ({ code: 'sample-code' }) }));

const memory: Record<string, any> = {};
jest.mock('../../packages/shared/src/dynamo', () => ({
  putItem: jest.fn(async (_t: string, item: any) => { memory[item.id] = item; }),
  getItem: jest.fn(async (_t: string, key: any) => memory[key.id]),
  scanTable: jest.fn(async () => Object.values(memory)),
}));

jest.mock('../../packages/shared/src/s3', () => ({
  uploadObject: jest.fn(async () => undefined)
}));

test('create app flow completes', async () => {
  const res = await request(app).post('/api/createApp').send({ description: 'test app' });
  expect(res.status).toBe(202);
  const id = res.body.jobId;
  expect(id).toBeTruthy();
  await new Promise(r => setTimeout(r, 10));
  const status = await request(app).get(`/api/status/${id}`);
  expect(status.body.status).toBe('complete');
});
