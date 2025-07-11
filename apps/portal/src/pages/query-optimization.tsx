import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function QueryOptimization() {
  const { data, mutate } = useSWR('/query-optimizer/recommendations', fetcher);

  const apply = async (id: string) => {
    await fetch(`/query-optimizer/recommendations/${id}/apply`, {
      method: 'POST',
    });
    mutate();
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Query Optimization Suggestions</h1>
      {data.map((r: any) => (
        <div key={r.id} style={{ marginBottom: 10 }}>
          <pre>{r.query}</pre>
          <p>{r.suggestion}</p>
          {!r.applied && <button onClick={() => apply(r.id)}>Apply</button>}
          {r.applied && <span>Applied</span>}
        </div>
      ))}
    </div>
  );
}
