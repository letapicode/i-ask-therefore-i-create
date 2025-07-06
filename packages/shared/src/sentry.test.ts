import * as Sentry from '@sentry/node';
import { initSentry } from './sentry';

jest.mock('@sentry/node');

test('initializes when DSN provided', () => {
  process.env.SENTRY_DSN = 'http://example.com';
  initSentry('test');
  expect(Sentry.init).toHaveBeenCalled();
  delete process.env.SENTRY_DSN;
});
