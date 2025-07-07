import { logAudit } from './audit';
import fs from 'fs';

const FILE = 'test-audit.log';

afterEach(() => {
  if (fs.existsSync(FILE)) fs.unlinkSync(FILE);
});

test('writes log entry', () => {
  process.env.AUDIT_LOG = FILE;
  logAudit('hello');
  const content = fs.readFileSync(FILE, 'utf-8');
  expect(content).toContain('hello');
});
