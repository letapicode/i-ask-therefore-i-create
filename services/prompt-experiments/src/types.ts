export interface VariantRecord {
  prompt: string;
  success: number;
  total: number;
}

export interface Experiment {
  id: string;
  name: string;
  variants: Record<string, VariantRecord>;
  winner?: string;
  created: number;
}

export interface VariantSummary extends VariantRecord {
  rate: number;
  ciLow: number;
  ciHigh: number;
  lift: number;
  liftPercent: number | null;
  isBaseline: boolean;
  significant: boolean;
}

export interface ExperimentSummary {
  id: string;
  name: string;
  winner?: string;
  variants: Record<string, VariantSummary>;
  best?: string;
  leaderByLowerBound?: string;
  baseline?: string;
}
