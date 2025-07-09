import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Business() {
  const { data } = useSWR('/analytics/businessTips', fetcher);
  const { data: forecast } = useSWR('/api/costForecast', fetcher);
  return (
    <div style={{ padding: 20 }}>
      <h1>Monetization Insights</h1>
      {!data && <p>Loading tips...</p>}
      {data && (
        <>
          <ul>
            {data.tips.map((t: string, i: number) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
          <p style={{ marginTop: 10 }}>{data.marketing}</p>
        </>
      )}
      {forecast && (
        <p style={{ marginTop: 20 }}>
          Projected monthly cost: ${'{'}forecast.costForecast.toFixed(2){'}'}
        </p>
      )}
    </div>
  );
}
