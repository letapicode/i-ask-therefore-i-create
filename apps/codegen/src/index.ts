import express from 'express';
import { retry } from '../../packages/retry/src';
import { initSentry } from '../../packages/shared/src/sentry';
import { generateCode } from './openai';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);

const cache = new Map<string, string>();

app.post('/generate', async (req, res) => {
  const { jobId, description, language = 'node' } = req.body;
  console.log('generating code for', jobId, description, language);
  try {
    const cacheKey = `${language}:${description}`;
    if (description && cache.has(cacheKey)) {
      return res.json({ ok: true, code: cache.get(cacheKey) });
    }
    const code = await retry(async () => {
      if (!description) throw new Error('invalid');
      return generateCode({ description, language });
    });
    if (description) {
      cache.set(cacheKey, code);
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
