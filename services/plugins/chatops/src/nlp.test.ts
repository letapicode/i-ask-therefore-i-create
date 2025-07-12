import { parseMessage } from './nlp';

test('extracts redeploy intent and id', () => {
  const res = parseMessage('please redeploy job 42');
  expect(res.intent).toBe('redeploy');
  expect(res.jobId).toBe('42');
});

test('uses last job id for status', () => {
  const res = parseMessage('status please', '99');
  expect(res.intent).toBe('status');
  expect(res.jobId).toBe('99');
});
