import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Activity() {
  const { data } = useSWR('/api/reviews', fetcher);
  return (
    <div style={{ padding: 20 }}>
      <h1>Review Activity</h1>
      <ul>
        {data?.map((r: any, i: number) => (
          <li key={i}>
            {r.repo} PR #{r.pr} - lint {r.lintErrors}, vulns {r.vulnerabilities}
          </li>
        ))}
      </ul>
    </div>
  );
}
