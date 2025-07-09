jest.mock('kafkajs', () => {
  const producer = {
    connect: jest.fn(),
    send: jest.fn(),
    disconnect: jest.fn(),
  };
  const consumer = { connect: jest.fn(), subscribe: jest.fn(), run: jest.fn() };
  return {
    Kafka: jest.fn(() => ({
      producer: () => producer,
      consumer: () => consumer,
    })),
    logLevel: { NOTHING: 0 },
  };
});
import { produceKafka, consumeKafka } from './kafka';

test('produceKafka sends message', async () => {
  await produceKafka({ brokers: ['b'], topic: 't' }, 'm');
  const { Kafka } = require('kafkajs');
  const instance = Kafka.mock.results[0].value;
  expect(instance.producer().send).toHaveBeenCalled();
});

test('produceKafka validates options', async () => {
  await expect(produceKafka({ brokers: [], topic: 't' }, 'm')).rejects.toThrow(
    'missing brokers'
  );
  await expect(
    produceKafka({ brokers: ['b'], topic: '' }, 'm')
  ).rejects.toThrow('missing topic');
});

test('consumeKafka calls handler', async () => {
  const handler = jest.fn();
  const { Kafka } = require('kafkajs');
  const consumer = {
    connect: jest.fn(),
    subscribe: jest.fn(),
    run: jest.fn(async (cfg) => {
      await cfg.eachMessage({ message: { value: Buffer.from('x') } });
    }),
  };
  Kafka.mockImplementation(() => ({
    producer: jest.fn(),
    consumer: () => consumer,
  }));
  await consumeKafka({ brokers: ['b'], topic: 't' }, handler);
  expect(handler).toHaveBeenCalledWith('x');
});

test('consumeKafka validates options', async () => {
  const handler = jest.fn();
  await expect(
    consumeKafka({ brokers: [], topic: 't' }, handler)
  ).rejects.toThrow('missing brokers');
  await expect(
    consumeKafka({ brokers: ['b'], topic: '' }, handler)
  ).rejects.toThrow('missing topic');
});
