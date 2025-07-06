import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Dashboard() {
  const { data } = useSWR('/analytics/summary', fetcher);
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      {!data && <p>Loading...</p>}
      {data && (
        <ul>
          {Object.entries(data).map(([type, count]) => (
            <li key={type}>{type}: {count as any}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
