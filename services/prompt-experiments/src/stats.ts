import type { Experiment, VariantRecord, VariantSummary } from './types';

const DEFAULT_Z = 1.96; // 95% confidence interval

export function calculateRate(success: number, total: number): number {
  if (!total) return 0;
  return success / total;
}

export function wilsonInterval(
  success: number,
  total: number,
  z = DEFAULT_Z
): { lower: number; upper: number } {
  if (total === 0) {
    return { lower: 0, upper: 1 };
  }
  const p = success / total;
  const denominator = 1 + (z * z) / total;
  const centre = p + (z * z) / (2 * total);
  const margin =
    z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);
  const lower = Math.max(0, (centre - margin) / denominator);
  const upper = Math.min(1, (centre + margin) / denominator);
  return { lower, upper };
}

function selectBaselineVariant(
  variants: Record<string, VariantRecord>
): string | undefined {
  let baseline: string | undefined;
  let maxTotal = -1;
  for (const [name, variant] of Object.entries(variants)) {
    if (variant.total > maxTotal) {
      maxTotal = variant.total;
      baseline = name;
    }
  }
  return baseline;
}

export function summarizeExperiment(
  experiment: Experiment
): {
  summary: VariantSummary[];
  byName: Record<string, VariantSummary>;
  bestByRate?: string;
  bestByLowerBound?: string;
  baseline?: string;
} {
  const summaries: VariantSummary[] = [];
  let bestRate = -1;
  let bestByRate: string | undefined;
  let bestLowerBound = -1;
  let bestByLowerBound: string | undefined;

  const baselineName = selectBaselineVariant(experiment.variants);
  const baselineRecord = baselineName
    ? experiment.variants[baselineName]
    : undefined;
  const baselineRate = baselineRecord
    ? calculateRate(baselineRecord.success, baselineRecord.total)
    : 0;
  const baselineInterval = baselineRecord
    ? wilsonInterval(baselineRecord.success, baselineRecord.total)
    : { lower: 0, upper: 1 };

  for (const [name, variant] of Object.entries(experiment.variants)) {
    const rate = calculateRate(variant.success, variant.total);
    const { lower, upper } = wilsonInterval(variant.success, variant.total);
    const lift = rate - (name === baselineName ? rate : baselineRate);
    const liftPercent =
      baselineName && baselineRate > 0
        ? (lift / baselineRate) * 100
        : baselineName && baselineRate === 0 && lift > 0
        ? Infinity
        : name === baselineName
        ? 0
        : null;
    const significant =
      !!baselineName &&
      baselineName !== name &&
      lower > baselineInterval.upper;

    const summary: VariantSummary = {
      prompt: variant.prompt,
      success: variant.success,
      total: variant.total,
      rate,
      ciLow: lower,
      ciHigh: upper,
      lift: name === baselineName ? 0 : lift,
      liftPercent: Number.isFinite(liftPercent) ? liftPercent : null,
      isBaseline: name === baselineName,
      significant,
    };
    summaries.push(summary);

    if (rate > bestRate) {
      bestRate = rate;
      bestByRate = name;
    }
    if (lower > bestLowerBound) {
      bestLowerBound = lower;
      bestByLowerBound = name;
    }
  }

  const byName: Record<string, VariantSummary> = {};
  Object.keys(experiment.variants).forEach((name, index) => {
    byName[name] = summaries[index];
  });

  return {
    summary: summaries,
    byName,
    bestByRate,
    bestByLowerBound,
    baseline: baselineName,
  };
}
