import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Plugins() {
  const { data, mutate } = useSWR('/marketplace/plugins', fetcher);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const add = async () => {
    await fetch('/marketplace/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc }),
    });
    setName('');
    setDesc('');
    mutate();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Plugin Marketplace</h1>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <button onClick={add}>Publish</button>
      <ul>
        {data &&
          data.map((p: any, i: number) => (
            <li key={i}>
              {p.name} - {p.description}
            </li>
          ))}
      </ul>
    </div>
  );
}
