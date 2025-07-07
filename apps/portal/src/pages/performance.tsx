import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Performance() {
  const { data } = useSWR('/analytics/performance', fetcher, {
    refreshInterval: 5000,
  });
  return (
    <div style={{ padding: 20 }}>
      <h1>Performance Metrics</h1>
      {!data && <p>Loading...</p>}
      {data && (
        <ul>
          {data.map((e: any, i: number) => (
            <li key={i}>
              {e.metric}: {e.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
