import express from 'express';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { logAudit } from '../../packages/shared/src/audit';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';

export interface Field {
  name: string;
  type: string;
}
export interface Schema {
  fields: Field[];
}

const TEMPLATE_DIR = path.join(
  __dirname,
  '..',
  '..',
  'packages',
  'codegen-templates',
  'data-templates'
);

export function loadSchema(name: string): Schema {
  const file = path.join(TEMPLATE_DIR, `${name}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as Schema;
}

const FIRST = ['Alice', 'Bob', 'Carol', 'Dave'];
const LAST = ['Smith', 'Jones', 'Lee', 'Brown'];

function sample(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRecord(schema: Schema): Record<string, any> {
  const record: Record<string, any> = {};
  for (const field of schema.fields) {
    switch (field.type) {
      case 'uuid':
        record[field.name] = randomUUID();
        break;
      case 'firstName':
        record[field.name] = sample(FIRST);
        break;
      case 'lastName':
        record[field.name] = sample(LAST);
        break;
      case 'email': {
        const first = sample(FIRST).toLowerCase();
        const last = sample(LAST).toLowerCase();
        record[field.name] = `${first}.${last}@example.com`;
        break;
      }
      case 'number':
        record[field.name] = Math.floor(Math.random() * 1000);
        break;
      default:
        record[field.name] = Math.random().toString(36).slice(2, 8);
    }
  }
  return record;
}

export function generateData(template: string, count = 10): any[] {
  const schema = loadSchema(template);
  const list = [] as any[];
  for (let i = 0; i < count; i++) list.push(generateRecord(schema));
  return list;
}

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`synthetic-data ${req.method} ${req.url}`);
  next();
});

app.post('/generate', (req, res) => {
  const { template, count } = req.body as { template?: string; count?: number };
  if (!template) return res.status(400).json({ error: 'missing template' });
  try {
    const data = generateData(template, count || 10);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'generation failed' });
  }
});

export function start(port = 3011) {
  app.listen(port, () => console.log(`synthetic data service on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3011);
}
