import {
  KinesisClient,
  PutRecordCommand,
  ListShardsCommand,
  GetShardIteratorCommand,
  GetRecordsCommand,
} from '@aws-sdk/client-kinesis';

export interface KinesisOptions {
  streamName: string;
  region?: string;
  credentials?: { accessKeyId: string; secretAccessKey: string };
}

export async function putKinesis(
  opts: KinesisOptions,
  data: string
): Promise<void> {
  const client = new KinesisClient({
    region: opts.region,
    credentials: opts.credentials,
  });
  await client.send(
    new PutRecordCommand({
      StreamName: opts.streamName,
      PartitionKey: 'partition',
      Data: Buffer.from(data),
    })
  );
}

export async function consumeKinesis(
  opts: KinesisOptions,
  onRecord: (data: string) => Promise<void>
): Promise<void> {
  const client = new KinesisClient({
    region: opts.region,
    credentials: opts.credentials,
  });
  const { Shards } = await client.send(
    new ListShardsCommand({ StreamName: opts.streamName })
  );
  if (!Shards || Shards.length === 0) return;
  const shardId = Shards[0].ShardId as string;
  const { ShardIterator } = await client.send(
    new GetShardIteratorCommand({
      StreamName: opts.streamName,
      ShardId: shardId,
      ShardIteratorType: 'LATEST',
    })
  );
  if (!ShardIterator) return;
  const { Records } = await client.send(
    new GetRecordsCommand({ ShardIterator })
  );
  for (const record of Records || []) {
    const dataStr = Buffer.from(record.Data as Uint8Array).toString();
    await onRecord(dataStr);
  }
}
