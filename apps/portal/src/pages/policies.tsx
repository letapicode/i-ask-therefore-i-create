import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Policies() {
  const { data } = useSWR('/api/policy?region=us', fetcher);
  return (
    <div style={{padding:20}}>
      <h1>Region Policy</h1>
      {data && <pre>{JSON.stringify(data,null,2)}</pre>}
    </div>
  );
}
