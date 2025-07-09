import request from 'supertest';
import { app } from './index';
import fs from 'fs';

const DIR = '.test-patches';
process.env.PATCH_DIR = DIR;
process.env.TEST_MODE = '1';

afterEach(() => {
  if (fs.existsSync(DIR)) fs.rmSync(DIR, { recursive: true });
});

test('saves patch to directory', async () => {
  const res = await request(app).post('/applyPatch').send({ patch: 'diff' });
  expect(res.status).toBe(200);
  expect(fs.existsSync(DIR)).toBe(true);
});
