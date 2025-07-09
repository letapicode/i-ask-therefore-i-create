import express from 'express';
import fs from 'fs';
import path from 'path';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import { logAudit } from '../../packages/shared/src/audit';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`pricing ${req.method} ${req.url}`);
  next();
});

const DATA_FILE = path.join(__dirname, '..', 'prices.json');
const CACHE_FILE = path.join(__dirname, '..', '.cache.json');

interface Price {
  cpu: number; // per hour
  memory: number; // per GB hour
}

interface PriceMap {
  [provider: string]: {
    [region: string]: Price;
  };
}

function loadPrices(): PriceMap {
  if (fs.existsSync(CACHE_FILE)) {
    const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    if (Date.now() - cached.time < 24 * 3600 * 1000) {
      return cached.prices as PriceMap;
    }
  }
  const prices: PriceMap = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  fs.writeFileSync(
    CACHE_FILE,
    JSON.stringify({ time: Date.now(), prices }, null, 2)
  );
  return prices;
}

function computeCost(price: Price, cpu: number, memory: number) {
  return cpu * price.cpu + memory * price.memory;
}

app.get('/estimate', (_req, res) => {
  const { provider, region, cpu = '0', memory = '0' } = _req.query as {
    provider?: string;
    region?: string;
    cpu?: string;
    memory?: string;
  };
  const prices = loadPrices();
  if (!provider || !region || !prices[provider]?.[region]) {
    return res.status(400).json({ error: 'invalid provider or region' });
  }
  const cost = computeCost(
    prices[provider][region],
    Number(cpu),
    Number(memory)
  );
  res.json({ provider, region, cost });
});

app.get('/recommend', (_req, res) => {
  const { cpu = '0', memory = '0', regions, failover } = _req.query as {
    cpu?: string;
    memory?: string;
    regions?: string;
    failover?: string;
  };
  const cpuNum = Number(cpu);
  const memNum = Number(memory);
  const limitRegions = regions ? regions.split(',') : undefined;
  const prices = loadPrices();
  let best: { provider: string; region: string; cost: number } | null = null;
  for (const [provider, regionsMap] of Object.entries(prices)) {
    for (const [region, price] of Object.entries(regionsMap)) {
      if (limitRegions && !limitRegions.includes(region)) continue;
      let cost = computeCost(price, cpuNum, memNum);
      if (failover === 'true') cost *= 2;
      if (!best || cost < best.cost) {
        best = { provider, region, cost };
      }
    }
  }
  res.json({ recommendation: best });
});

export function start(port = 3008) {
  app.listen(port, () => console.log(`pricing service listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3008);
}
