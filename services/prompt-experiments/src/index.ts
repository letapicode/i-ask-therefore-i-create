import express, { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { policyMiddleware } from '../../packages/shared/src/policyMiddleware';
import { logAudit } from '../../packages/shared/src/audit';
import { sanitize } from '../../packages/shared/src/sanitize';
import type {
  Experiment,
  ExperimentSummary,
  VariantSummary,
} from './types';
import { mutateExperiments, readExperiments } from './storage';
import { summarizeExperiment } from './stats';

export { clearExperimentCache } from './storage';

export const app = express();
app.use(express.json());
app.use(policyMiddleware);
app.use((req, _res, next) => {
  logAudit(`prompt-experiments ${req.method} ${req.url}`);
  next();
});

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const asyncHandler = (handler: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };

function ensureExperiment(
  experiments: Experiment[],
  id: string
): Experiment {
  const experiment = experiments.find((e) => e.id === id);
  if (!experiment) {
    throw new HttpError(404, 'not found');
  }
  return experiment;
}

function toSummary(experiment: Experiment): ExperimentSummary {
  const { byName, bestByRate, bestByLowerBound, baseline } =
    summarizeExperiment(experiment);
  return {
    id: experiment.id,
    name: experiment.name,
    winner: experiment.winner,
    variants: byName,
    best: bestByRate,
    leaderByLowerBound: bestByLowerBound,
    baseline,
  };
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return Number(value).toFixed(6);
}

function exportCsv(experiment: Experiment): string {
  const { byName } = summarizeExperiment(experiment);
  const header =
    'variant,prompt,success,total,rate,ci_low,ci_high,lift,lift_pct,significant,is_baseline';
  const rows = Object.entries(experiment.variants).map(([name, variant]) => {
    const metrics: VariantSummary = byName[name];
    const prompt = `"${variant.prompt.replace(/"/g, '""')}"`;
    return [
      name,
      prompt,
      variant.success,
      variant.total,
      formatNumber(metrics.rate),
      formatNumber(metrics.ciLow),
      formatNumber(metrics.ciHigh),
      formatNumber(metrics.lift),
      formatNumber(metrics.liftPercent),
      metrics.significant,
      metrics.isBaseline,
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

app.get(
  '/experiments',
  asyncHandler(async (_req, res) => {
    const experiments = await readExperiments();
    res.json(experiments);
  })
);

app.get(
  '/experiments/summary',
  asyncHandler(async (_req, res) => {
    const experiments = await readExperiments();
    res.json(experiments.map(toSummary));
  })
);

app.post(
  '/experiments',
  asyncHandler(async (req, res) => {
    const { name, variants } = req.body as {
      name?: string;
      variants?: Record<string, { prompt: string }>;
    };
    if (!name || !variants) {
      throw new HttpError(400, 'missing fields');
    }

    const { result } = await mutateExperiments((experiments) => {
      const record: Experiment = {
        id: randomUUID(),
        name: sanitize(name),
        variants: Object.fromEntries(
          Object.entries(variants).map(([key, value]) => [
            key,
            { prompt: sanitize(value.prompt), success: 0, total: 0 },
          ])
        ),
        created: Date.now(),
      };
      experiments.push(record);
      return record;
    });

    res.status(201).json(result);
  })
);

app.post(
  '/experiments/:id/variants',
  asyncHandler(async (req, res) => {
    const { name, prompt } = req.body as {
      name?: string;
      prompt?: string;
    };
    if (!name || !prompt) {
      throw new HttpError(400, 'missing fields');
    }

    const { result } = await mutateExperiments((experiments) => {
      const experiment = ensureExperiment(experiments, req.params.id);
      const cleanName = sanitize(name);
      if (experiment.variants[cleanName]) {
        throw new HttpError(400, 'variant exists');
      }
      experiment.variants[cleanName] = {
        prompt: sanitize(prompt),
        success: 0,
        total: 0,
      };
      return experiment.variants[cleanName];
    });

    res.status(201).json(result);
  })
);

app.put(
  '/experiments/:id/variants/:name',
  asyncHandler(async (req, res) => {
    const { prompt } = req.body as { prompt?: string };
    if (!prompt) {
      throw new HttpError(400, 'missing fields');
    }

    const { result } = await mutateExperiments((experiments) => {
      const experiment = ensureExperiment(experiments, req.params.id);
      const variantName = sanitize(req.params.name);
      const variant = experiment.variants[variantName];
      if (!variant) {
        throw new HttpError(404, 'variant not found');
      }
      variant.prompt = sanitize(prompt);
      return variant;
    });

    res.json(result);
  })
);

app.put(
  '/experiments/:id/variants/:name/name',
  asyncHandler(async (req, res) => {
    const { name } = req.body as { name?: string };
    if (!name) {
      throw new HttpError(400, 'missing fields');
    }

    const { result } = await mutateExperiments((experiments) => {
      const experiment = ensureExperiment(experiments, req.params.id);
      const oldName = sanitize(req.params.name);
      const variant = experiment.variants[oldName];
      if (!variant) {
        throw new HttpError(404, 'variant not found');
      }
      const newName = sanitize(name);
      if (experiment.variants[newName]) {
        throw new HttpError(400, 'variant exists');
      }
      experiment.variants[newName] = variant;
      delete experiment.variants[oldName];
      if (experiment.winner === oldName) {
        experiment.winner = newName;
      }
      return experiment.variants[newName];
    });

    res.json(result);
  })
);

app.post(
  '/experiments/:id/variants/:name/clone',
  asyncHandler(async (req, res) => {
    const { name } = req.body as { name?: string };
    if (!name) {
      throw new HttpError(400, 'missing fields');
    }

    const { result } = await mutateExperiments((experiments) => {
      const experiment = ensureExperiment(experiments, req.params.id);
      const sourceName = sanitize(req.params.name);
      const source = experiment.variants[sourceName];
      if (!source) {
        throw new HttpError(404, 'variant not found');
      }
      const newName = sanitize(name);
      if (experiment.variants[newName]) {
        throw new HttpError(400, 'variant exists');
      }
      experiment.variants[newName] = {
        prompt: source.prompt,
        success: 0,
        total: 0,
      };
      return experiment.variants[newName];
    });

    res.status(201).json(result);
  })
);

app.post(
  '/experiments/:id/variants/:name/reset',
  asyncHandler(async (req, res) => {
    const { result } = await mutateExperiments((experiments) => {
      const experiment = ensureExperiment(experiments, req.params.id);
      const variantName = sanitize(req.params.name);
      const variant = experiment.variants[variantName];
      if (!variant) {
        throw new HttpError(404, 'variant not found');
      }
      variant.success = 0;
      variant.total = 0;
      if (experiment.winner === variantName) {
        delete experiment.winner;
      }
      return variant;
    });

    res.json(result);
  })
);

app.delete(
  '/experiments/:id/variants/:name',
  asyncHandler(async (req, res) => {
    const { result } = await mutateExperiments((experiments) => {
      const experiment = ensureExperiment(experiments, req.params.id);
      const variantName = sanitize(req.params.name);
      if (!experiment.variants[variantName]) {
        throw new HttpError(404, 'variant not found');
      }
      delete experiment.variants[variantName];
      if (experiment.winner === variantName) {
        delete experiment.winner;
      }
      return { ok: true };
    });

    res.json(result);
  })
);

app.get(
  '/experiments/:id',
  asyncHandler(async (req, res) => {
    const experiments = await readExperiments();
    const experiment = experiments.find((e) => e.id === req.params.id);
    if (!experiment) {
      throw new HttpError(404, 'not found');
    }
    res.json(experiment);
  })
);

app.get(
  '/experiments/:id/summary',
  asyncHandler(async (req, res) => {
    const experiments = await readExperiments();
    const experiment = experiments.find((e) => e.id === req.params.id);
    if (!experiment) {
      throw new HttpError(404, 'not found');
    }
    res.json(toSummary(experiment));
  })
);

app.get(
  '/experiments/:id/export',
  asyncHandler(async (req, res) => {
    const experiments = await readExperiments();
    const experiment = experiments.find((e) => e.id === req.params.id);
    if (!experiment) {
      throw new HttpError(404, 'not found');
    }
    const csv = exportCsv(experiment);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${experiment.id}.csv"`
    );
    res.send(csv);
  })
);

app.post(
  '/experiments/:id/clone',
  asyncHandler(async (req, res) => {
    const { result } = await mutateExperiments((experiments) => {
      const experiment = ensureExperiment(experiments, req.params.id);
      const clone: Experiment = {
        id: randomUUID(),
        name: sanitize(`${experiment.name} copy`),
        variants: Object.fromEntries(
          Object.entries(experiment.variants).map(([name, value]) => [
            name,
            { prompt: value.prompt, success: 0, total: 0 },
          ])
        ),
        created: Date.now(),
      };
      experiments.push(clone);
      return clone;
    });

    res.status(201).json(result);
  })
);

app.post(
  '/experiments/:id/reset',
  asyncHandler(async (req, res) => {
    const { result } = await mutateExperiments((experiments) => {
      const experiment = ensureExperiment(experiments, req.params.id);
      for (const variant of Object.values(experiment.variants)) {
        variant.success = 0;
        variant.total = 0;
      }
      delete experiment.winner;
      return experiment;
    });

    res.json(result);
  })
);

app.put(
  '/experiments/:id/name',
  asyncHandler(async (req, res) => {
    const { name } = req.body as { name?: string };
    if (!name) {
      throw new HttpError(400, 'missing fields');
    }

    const { result } = await mutateExperiments((experiments) => {
      const experiment = ensureExperiment(experiments, req.params.id);
      experiment.name = sanitize(name);
      return experiment;
    });

    res.json(result);
  })
);

app.put(
  '/experiments/:id',
  asyncHandler(async (req, res) => {
    const { variant, success, winner } = req.body as {
      variant?: string;
      success?: boolean;
      winner?: string;
    };

    const { result } = await mutateExperiments((experiments) => {
      const experiment = ensureExperiment(experiments, req.params.id);

      if (winner) {
        const cleanWinner = sanitize(winner);
        if (!experiment.variants[cleanWinner]) {
          throw new HttpError(400, 'winner not found');
        }
        experiment.winner = cleanWinner;
      }

      if (variant) {
        const cleanVariant = sanitize(variant);
        const variantRecord = experiment.variants[cleanVariant];
        if (!variantRecord) {
          throw new HttpError(400, 'variant not found');
        }
        variantRecord.total += 1;
        if (success) {
          variantRecord.success += 1;
        }
      }

      return experiment;
    });

    res.json(result);
  })
);

app.delete(
  '/experiments/:id',
  asyncHandler(async (req, res) => {
    const { result } = await mutateExperiments((experiments) => {
      const index = experiments.findIndex((e) => e.id === req.params.id);
      if (index === -1) {
        throw new HttpError(404, 'not found');
      }
      experiments.splice(index, 1);
      return { ok: true };
    });

    res.json(result);
  })
);

app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error('prompt-experiments error', err);
    res.status(500).json({ error: 'internal error' });
  }
);

export function start(port = 3016) {
  app.listen(port, () =>
    console.log(`prompt-experiments listening on ${port}`)
  );
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3016);
}
