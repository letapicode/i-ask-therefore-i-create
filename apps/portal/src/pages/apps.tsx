import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Apps() {
  const { data } = useSWR('http://localhost:3002/api/apps', fetcher);
  return (
    <div>
      <h1>Your Apps</h1>
      <ul>
        {data?.map((app: any) => (
          <li key={app.id}>{app.description} - {app.status}</li>
        ))}
      </ul>
    </div>
  );
}
