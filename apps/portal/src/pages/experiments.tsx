import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Experiments() {
  const { data } = useSWR('/api/experiments/summary', fetcher);
  return (
    <div style={{ padding: 20 }}>
      <h1>Experiments</h1>
      <ul>
        {data &&
          data.map((e: any) => (
            <li key={e.id}>
              {e.name}: best {e.best} {e.winner && `(winner: ${e.winner})`}{' '}
              <a href={`/api/experiments/${e.id}/export`}>Export</a>
            </li>
          ))}
      </ul>
    </div>
  );
}
