import express from 'express';
import { retry } from '../../packages/retry/src';
import { initSentry } from '../../packages/shared/src/sentry';

const app = express();
app.use(express.json());

app.post('/generate', async (req, res) => {
  const { jobId, description } = req.body;
  console.log('generating code for', jobId, description);
  await retry(async () => {
    // placeholder for real generation logic
    if (!description) throw new Error('invalid');
  });
  res.json({ ok: true });
});

export function start(port = 3003) {
  initSentry('codegen');
  app.listen(port, () => console.log(`codegen listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3003);
}
