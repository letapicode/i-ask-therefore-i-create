import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Apps() {
  const { data, mutate } = useSWR('http://localhost:3002/api/apps', fetcher);

  const publish = async (id: string) => {
    await fetch(`http://localhost:3002/api/publishMobile/${id}`, {
      method: 'POST',
      headers: { 'x-tenant-id': 't1' },
    });
    mutate();
    alert('publish triggered');
  };

  return (
    <div>
      <h1>Your Apps</h1>
      <ul>
        {data?.map((app: any) => (
          <li key={app.id}>
            {app.description} - {app.status}{' '}
            <button onClick={() => publish(app.id)}>Publish to Store</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
