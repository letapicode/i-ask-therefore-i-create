import express from 'express';
import { retry } from '../../packages/retry/src';
import { initSentry } from '../../packages/shared/src/sentry';
import { generateCode } from './openai';

export const app = express();
app.use(express.json());

const cache = new Map<string, string>();

app.post('/generate', async (req, res) => {
  const { jobId, description } = req.body;
  console.log('generating code for', jobId, description);
  try {
    if (description && cache.has(description)) {
      return res.json({ ok: true, code: cache.get(description) });
    }
    const code = await retry(async () => {
      if (!description) throw new Error('invalid');
      return generateCode({ description });
    });
    if (description) {
      cache.set(description, code);
    }
    res.json({ ok: true, code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export function start(port = 3003) {
  initSentry('codegen');
  app.listen(port, () => console.log(`codegen listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3003);
}
