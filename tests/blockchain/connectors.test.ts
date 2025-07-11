jest.mock('ethers', () => {
  return {
    JsonRpcProvider: jest.fn(() => ({
      getBalance: jest.fn(async () => BigInt(5)),
    })),
    Wallet: jest.fn(() => ({
      sendTransaction: jest.fn(async () => ({
        wait: async () => undefined,
        hash: '0xtx',
      })),
    })),
  };
});

import {
  ethereumConnector,
  polygonConnector,
} from '../../packages/data-connectors/src/blockchain';

test('ethereum connector reads balance', async () => {
  const eth = ethereumConnector({ rpcUrl: 'url', privateKey: 'k' });
  const bal = await eth.getBalance('0x1');
  expect(bal).toBe('5');
});

test('polygon connector sends tx', async () => {
  const poly = polygonConnector({ rpcUrl: 'url', privateKey: 'k' });
  const hash = await poly.sendTransaction('0x2', BigInt(1));
  expect(hash).toBe('0xtx');
});

test('sendTransaction requires key', async () => {
  const eth = ethereumConnector({ rpcUrl: 'url' });
  await expect(eth.sendTransaction('0x2', BigInt(1))).rejects.toThrow(
    'missing privateKey'
  );
});
