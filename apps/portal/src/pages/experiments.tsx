import useSWR from 'swr';

interface VariantSummary {
  prompt: string;
  success: number;
  total: number;
  rate: number;
  ciLow: number;
  ciHigh: number;
  lift: number;
  liftPercent: number | null;
  isBaseline: boolean;
  significant: boolean;
}

interface ExperimentSummary {
  id: string;
  name: string;
  winner?: string;
  baseline?: string;
  best?: string;
  leaderByLowerBound?: string;
  variants: Record<string, VariantSummary>;
}

const fetcher = (u: string) => fetch(u).then((r) => r.json());

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatLift(variant: VariantSummary) {
  if (variant.isBaseline) return '—';
  if (variant.liftPercent !== null) {
    return `${variant.liftPercent.toFixed(2)}%`;
  }
  return `${(variant.lift * 100).toFixed(2)} pts`;
}

export default function Experiments() {
  const { data } = useSWR<ExperimentSummary[]>('/api/experiments/summary', fetcher);
  return (
    <div style={{ padding: 20 }}>
      <h1>Experiments</h1>
      {!data && <p>Loading experiment metrics…</p>}
      {data && data.length === 0 && <p>No experiments have been created yet.</p>}
      {data &&
        data.map((experiment) => (
          <section key={experiment.id} style={{ marginBottom: 32 }}>
            <h2 style={{ marginBottom: 8 }}>{experiment.name}</h2>
            <p style={{ margin: '4px 0' }}>
              Best by conversion rate: <strong>{experiment.best ?? '—'}</strong>{' '}
              | Leader by confidence: <strong>{experiment.leaderByLowerBound ?? '—'}</strong>{' '}
              | Baseline: <strong>{experiment.baseline ?? '—'}</strong>{' '}
              {experiment.winner && (
                <>
                  | Declared winner: <strong>{experiment.winner}</strong>
                </>
              )}
            </p>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: 12,
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                    Variant
                  </th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                    Success Rate
                  </th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                    95% CI
                  </th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                    Lift
                  </th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                    Significant?
                  </th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                    Baseline
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(experiment.variants).map(([name, variant]) => (
                  <tr key={name}>
                    <td style={{ padding: '6px 4px', borderBottom: '1px solid #eee' }}>
                      <div style={{ fontWeight: 600 }}>{name}</div>
                      <div style={{ color: '#555', fontSize: 12 }}>{variant.prompt}</div>
                    </td>
                    <td style={{ padding: '6px 4px', borderBottom: '1px solid #eee' }}>
                      {formatPercent(variant.rate)} ({variant.success}/{variant.total})
                    </td>
                    <td style={{ padding: '6px 4px', borderBottom: '1px solid #eee' }}>
                      {formatPercent(variant.ciLow)} – {formatPercent(variant.ciHigh)}
                    </td>
                    <td style={{ padding: '6px 4px', borderBottom: '1px solid #eee' }}>
                      {formatLift(variant)}
                    </td>
                    <td style={{ padding: '6px 4px', borderBottom: '1px solid #eee' }}>
                      {variant.significant ? 'Yes' : 'No'}
                    </td>
                    <td style={{ padding: '6px 4px', borderBottom: '1px solid #eee' }}>
                      {variant.isBaseline ? 'Baseline' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 8 }}>
              <a href={`/api/experiments/${experiment.id}/export`}>Export CSV</a>
            </div>
          </section>
        ))}
    </div>
  );
}
