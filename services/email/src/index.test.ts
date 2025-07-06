import { sendEmail } from './index';

test('sendEmail function is defined', () => {
  expect(typeof sendEmail).toBe('function');
});
