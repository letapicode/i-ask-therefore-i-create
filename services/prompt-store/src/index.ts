import express from 'express';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import { logAudit } from '../../packages/shared/src/audit';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`prompt-store ${req.method} ${req.url}`);
  next();
});

const DB_FILE = process.env.PROMPT_DB || '.prompts.json';

interface PromptVersion {
  id: string;
  text: string;
  time: number;
}

interface PromptRecord {
  id: string;
  name: string;
  versions: PromptVersion[];
}

function read(): PromptRecord[] {
  return fs.existsSync(DB_FILE)
    ? (JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as PromptRecord[])
    : [];
}

function save(data: PromptRecord[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function find(id: string, list: PromptRecord[]) {
  return list.find((p) => p.id === id);
}

app.get('/prompts', (_req, res) => {
  res.json(read());
});

app.post('/prompts', (req, res) => {
  const { name, text } = req.body as { name?: string; text?: string };
  if (!name || !text) return res.status(400).json({ error: 'missing fields' });
  const list = read();
  const record: PromptRecord = {
    id: randomUUID(),
    name,
    versions: [{ id: randomUUID(), text, time: Date.now() }],
  };
  list.push(record);
  save(list);
  res.status(201).json(record);
});

app.get('/prompts/:id', (req, res) => {
  const prompt = find(req.params.id, read());
  if (!prompt) return res.status(404).json({ error: 'not found' });
  res.json(prompt);
});

app.put('/prompts/:id', (req, res) => {
  const { text } = req.body as { text?: string };
  if (!text) return res.status(400).json({ error: 'missing text' });
  const list = read();
  const prompt = find(req.params.id, list);
  if (!prompt) return res.status(404).json({ error: 'not found' });
  prompt.versions.push({ id: randomUUID(), text, time: Date.now() });
  save(list);
  res.json(prompt);
});

app.delete('/prompts/:id', (req, res) => {
  const list = read();
  const idx = list.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  list.splice(idx, 1);
  save(list);
  res.json({ ok: true });
});

export function start(port = 3009) {
  app.listen(port, () => console.log(`prompt-store listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3009);
}
