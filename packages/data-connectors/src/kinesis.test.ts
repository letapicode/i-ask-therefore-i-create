jest.mock('@aws-sdk/client-kinesis', () => {
  const send = jest.fn(async (cmd) => {
    if (cmd.constructor.name === 'ListShardsCommand')
      return { Shards: [{ ShardId: '1' }] };
    if (cmd.constructor.name === 'GetShardIteratorCommand')
      return { ShardIterator: 'it' };
    if (cmd.constructor.name === 'GetRecordsCommand')
      return { Records: [{ Data: Buffer.from('y') }] };
    return {};
  });
  class KinesisClient {
    send = send;
  }
  const cmds = {
    PutRecordCommand: function () {},
    ListShardsCommand: function () {},
    GetShardIteratorCommand: function () {},
    GetRecordsCommand: function () {},
  };
  return { KinesisClient, ...cmds };
});
import { putKinesis, consumeKinesis } from './kinesis';

test('putKinesis sends record', async () => {
  const { KinesisClient } = require('@aws-sdk/client-kinesis');
  const client = new KinesisClient();
  await putKinesis({ streamName: 's' }, 'd');
  expect(client.send).toHaveBeenCalled();
});

test('putKinesis validates options', async () => {
  await expect(putKinesis({ streamName: '' }, 'd')).rejects.toThrow(
    'missing streamName'
  );
});

test('consumeKinesis processes records', async () => {
  const handler = jest.fn();
  await consumeKinesis({ streamName: 's' }, handler);
  expect(handler).toHaveBeenCalledWith('y');
});

test('consumeKinesis validates options', async () => {
  const handler = jest.fn();
  await expect(consumeKinesis({ streamName: '' }, handler)).rejects.toThrow(
    'missing streamName'
  );
});
