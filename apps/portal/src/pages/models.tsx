import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Models() {
  const { data, mutate } = useSWR('/api/communityModels', fetcher);
  const [version, setVersion] = useState('');

  const activate = async () => {
    await fetch('/api/communityModels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version }),
    });
    setVersion('');
    mutate();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Community Models</h1>
      <p>Active: {data?.active || 'none'}</p>
      <ul>
        {data?.versions?.map((v: string) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
      <input
        placeholder="Version"
        value={version}
        onChange={(e) => setVersion(e.target.value)}
      />
      <button onClick={activate}>Activate</button>
    </div>
  );
}
