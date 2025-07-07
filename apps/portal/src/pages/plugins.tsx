import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Plugins() {
  const { data, mutate } = useSWR('/marketplace/plugins', fetcher);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});

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

  const install = async (plugin: string) => {
    await fetch('/api/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: plugin }),
    });
    alert('installed');
  };

  const remove = async (plugin: string) => {
    await fetch(`/api/plugins/${plugin}`, { method: 'DELETE' });
    alert('removed');
  };

  const rate = async (plugin: string) => {
    await fetch('/plugins/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: plugin, value: ratings[plugin] || 0 }),
    });
    alert('rated');
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
              {p.name} - {p.description}{' '}
              <button onClick={() => install(p.name)}>Install</button>{' '}
              <button onClick={() => remove(p.name)}>Remove</button>{' '}
              <input
                type="number"
                min="1"
                max="5"
                value={ratings[p.name] || ''}
                onChange={(e) =>
                  setRatings({ ...ratings, [p.name]: Number(e.target.value) })
                }
              />
              <button onClick={() => rate(p.name)}>Rate</button>
            </li>
          ))}
      </ul>
    </div>
  );
}
