jest.mock('neo4j-driver', () => {
  const run = jest.fn(async () => ({ records: [{ toObject: () => ({ id: 1 }) }] }));
  const session = { run, close: jest.fn() };
  const driver = { session: () => session, close: jest.fn() };
  return {
    default: {
      driver: jest.fn(() => driver),
      auth: { basic: jest.fn() },
    },
  };
});

jest.mock('node-fetch', () => jest.fn(async () => ({ ok: true, json: async () => ({ result: 'ok' }) })));
import fetch from 'node-fetch';

import { createNeo4jConnector, createNeptuneConnector } from './graph';

test('neo4j connector runs query', async () => {
  const db = createNeo4jConnector({ url: 'u', user: 'a', password: 'b' });
  const res = await db.query('MATCH (n) RETURN n');
  expect(res[0].id).toBe(1);
});

test('neptune connector posts query', async () => {
  const db = createNeptuneConnector({ endpoint: 'http://n' });
  const res = await db.query('g.V()');
  expect(fetch).toHaveBeenCalled();
  expect(res.result).toBe('ok');
});
