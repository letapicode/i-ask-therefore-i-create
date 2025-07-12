import { generateSeedData } from './seedData';
import fetch from 'node-fetch';

describe('generateSeedData', () => {
  const schema = { tables: [{ name: 't', columns: [{ name: 'id', type: 'uuid' }] }] } as any;
  const fetchMock = fetch as unknown as jest.Mock;

  beforeEach(() => {
    fetchMock.mockResolvedValue({ json: async () => ({ choices: [{ message: { content: '[{"id":1}]' } }] }) });
  });

  test('returns parsed array', async () => {
    const data = await generateSeedData({ schema, rows: 1 });
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
  });
});
