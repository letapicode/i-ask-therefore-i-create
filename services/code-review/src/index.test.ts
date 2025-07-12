import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { app } from './index';

test('review reports issues', async () => {
  const dir = path.join(__dirname, 'tmp');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.js'), 'eval("console.log(1)")');
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ dependencies: { lodash: '1.0.0' } })
  );
  const res = await request(app).post('/review').send({ repo: dir });
  expect(res.status).toBe(200);
  expect(res.body.lintErrors).toBeGreaterThan(0);
  expect(res.body.vulnerabilities).toBe(1);
  fs.rmSync(dir, { recursive: true, force: true });
});
