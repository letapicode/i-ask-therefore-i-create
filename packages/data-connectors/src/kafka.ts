import { Kafka, logLevel, SASLOptions } from 'kafkajs';

export interface KafkaOptions {
  brokers: string[];
  topic: string;
  ssl?: boolean;
  sasl?: SASLOptions;
}

function validateKafkaOptions(opts: KafkaOptions) {
  if (!opts.brokers || opts.brokers.length === 0)
    throw new Error('missing brokers');
  if (!opts.topic) throw new Error('missing topic');
}

export async function produceKafka(
  opts: KafkaOptions,
  message: string
): Promise<void> {
  validateKafkaOptions(opts);
  const kafka = new Kafka({
    brokers: opts.brokers,
    ssl: opts.ssl,
    sasl: opts.sasl,
    logLevel: logLevel.NOTHING,
  });
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({ topic: opts.topic, messages: [{ value: message }] });
  await producer.disconnect();
}

export async function consumeKafka(
  opts: KafkaOptions,
  onMessage: (msg: string) => Promise<void>
): Promise<void> {
  validateKafkaOptions(opts);
  const kafka = new Kafka({
    brokers: opts.brokers,
    ssl: opts.ssl,
    sasl: opts.sasl,
    logLevel: logLevel.NOTHING,
  });
  const consumer = kafka.consumer({ groupId: 'iac-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: opts.topic, fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (message.value) await onMessage(message.value.toString());
    },
  });
}
