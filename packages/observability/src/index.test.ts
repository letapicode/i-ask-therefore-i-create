import { NodeSDK } from '@opentelemetry/sdk-node';
import { initTracing } from './index';

jest.mock('@opentelemetry/sdk-node');

test('does not start without endpoint', () => {
  initTracing('test');
  expect(NodeSDK).not.toHaveBeenCalled();
});
