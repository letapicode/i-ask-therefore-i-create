import express from 'express';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { logAudit } from '../../packages/shared/src/audit';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import {
  recordPurchase,
  verifyLicense,
  getLicenseOwner,
  transferLicense,
} from '../../packages/data-connectors/src/blockchain';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`plugins ${req.method} ${req.url}`);
  next();
});

const DB = process.env.PLUGINS_DB || '.plugin-meta.json';
const LEDGER = process.env.BLOCKCHAIN_LEDGER || '.ledger.json';
const LISTINGS = process.env.PLUGIN_LISTINGS || '.resale.json';

interface PluginMeta {
  name: string;
  installs: number;
  ratings: number[];
}

function read(): PluginMeta[] {
  if (!fs.existsSync(DB)) return [];
  return JSON.parse(fs.readFileSync(DB, 'utf-8'));
}

function save(list: PluginMeta[]) {
  fs.writeFileSync(DB, JSON.stringify(list, null, 2));
}

function find(name: string, list: PluginMeta[]) {
  let p = list.find((pl) => pl.name === name);
  if (!p) {
    p = { name, installs: 0, ratings: [] };
    list.push(p);
  }
  return p;
}

interface Listing {
  plugin: string;
  licenseKey: string;
  price: number;
  seller: string;
}

function readListings(): Listing[] {
  return fs.existsSync(LISTINGS)
    ? (JSON.parse(fs.readFileSync(LISTINGS, 'utf-8')) as Listing[])
    : [];
}

function saveListings(data: Listing[]) {
  fs.writeFileSync(LISTINGS, JSON.stringify(data, null, 2));
}

app.post('/purchase', (req, res) => {
  const { name, buyer } = req.body as { name?: string; buyer?: string };
  if (!name || !buyer) return res.status(400).json({ error: 'missing fields' });
  const licenseKey = randomUUID();
  recordPurchase(name, buyer, licenseKey, LEDGER);
  res.status(201).json({ licenseKey });
});

app.post('/install', (req, res) => {
  const { name, licenseKey } = req.body as {
    name?: string;
    licenseKey?: string;
  };
  if (!name) return res.status(400).json({ error: 'missing name' });
  if (!licenseKey || !verifyLicense(name, licenseKey, LEDGER))
    return res.status(403).json({ error: 'invalid license' });
  const list = read();
  const p = find(name, list);
  p.installs++;
  save(list);
  res.status(201).json({ ok: true });
});

app.post('/remove', (req, res) => {
  const list = read();
  const p = find(req.body.name, list);
  if (p.installs > 0) p.installs--;
  save(list);
  res.json({ ok: true });
});

app.post('/rate', (req, res) => {
  const { name, value } = req.body;
  const list = read();
  const p = find(name, list);
  p.ratings.push(Number(value));
  save(list);
  res.status(201).json({ ok: true });
});

app.get('/listings', (_req, res) => {
  res.json(readListings());
});

app.post('/listings', (req, res) => {
  const { plugin, licenseKey, price, seller } = req.body as Listing;
  if (!plugin || !licenseKey || !seller)
    return res.status(400).json({ error: 'missing fields' });
  if (!verifyLicense(plugin, licenseKey, LEDGER))
    return res.status(400).json({ error: 'invalid license' });
  const owner = getLicenseOwner(plugin, licenseKey, LEDGER);
  if (owner !== seller)
    return res.status(403).json({ error: 'not owner' });
  const listings = readListings();
  listings.push({ plugin, licenseKey, price: Number(price) || 0, seller });
  saveListings(listings);
  res.status(201).json({ ok: true });
});

app.post('/purchase-listing', (req, res) => {
  const { plugin, licenseKey, buyer } = req.body as {
    plugin?: string;
    licenseKey?: string;
    buyer?: string;
  };
  if (!plugin || !licenseKey || !buyer)
    return res.status(400).json({ error: 'missing fields' });
  const listings = readListings();
  const idx = listings.findIndex(
    (l) => l.plugin === plugin && l.licenseKey === licenseKey,
  );
  if (idx === -1) return res.status(404).json({ error: 'listing not found' });
  const listing = listings[idx];
  try {
    transferLicense(plugin, licenseKey, listing.seller, buyer, LEDGER);
    listings.splice(idx, 1);
    saveListings(listings);
    res.status(201).json({ licenseKey });
  } catch (err) {
    res.status(400).json({ error: 'transfer failed' });
  }
});

app.get('/stats', (_req, res) => {
  res.json(read());
});

export function start(port = 3006) {
  app.listen(port, () => console.log(`plugins service listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3006);
}
