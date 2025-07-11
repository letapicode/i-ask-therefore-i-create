import fs from 'fs';
import path from 'path';
import { runBackup } from './backup';
import { uploadObject } from '../../packages/shared/src/s3';

jest.mock('../../packages/shared/src/s3', () => ({
  uploadObject: jest.fn(async () => undefined),
}));

const mocked = uploadObject as jest.MockedFunction<typeof uploadObject>;

afterEach(() => {
  mocked.mockClear();
});

test('runBackup uploads files from directory', async () => {
  const dir = fs.mkdtempSync('backup-test-');
  fs.writeFileSync(path.join(dir, 'file.txt'), 'data');
  await runBackup(dir, 'bucket');
  expect(mocked).toHaveBeenCalledWith(
    'bucket',
    expect.stringContaining('file.txt'),
    expect.any(Buffer)
  );
  fs.rmSync(dir, { recursive: true, force: true });
});
