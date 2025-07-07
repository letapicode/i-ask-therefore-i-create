import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Templates() {
  const { data } = useSWR('/marketplace/templates', fetcher);
  return (
    <div style={{ padding: 20 }}>
      <h1>Templates</h1>
      <ul>
        {data && data.map((t: any) => (
          <li key={t.name}>{t.name} - {t.description}</li>
        ))}
      </ul>
    </div>
  );
}
