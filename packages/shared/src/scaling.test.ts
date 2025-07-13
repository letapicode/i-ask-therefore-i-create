jest.mock('@aws-sdk/client-application-auto-scaling', () => {
  const send = jest.fn(async () => ({}));
  class ApplicationAutoScalingClient {
    send = send;
  }
  const cmds = {
    RegisterScalableTargetCommand: function () {},
    PutScalingPolicyCommand: function () {},
  };
  return { ApplicationAutoScalingClient, ...cmds };
});

import { updateEdgeScaling } from './scaling';

test('updateEdgeScaling registers target and policy', async () => {
  const { ApplicationAutoScalingClient } = require('@aws-sdk/client-application-auto-scaling');
  const client = new ApplicationAutoScalingClient();
  await updateEdgeScaling('fn', '1', 1, 5);
  expect(client.send).toHaveBeenCalled();
});
