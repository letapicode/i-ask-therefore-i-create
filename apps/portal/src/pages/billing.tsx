import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Billing() {
  const { data: plans, mutate } = useSWR('/billing/plans', fetcher);
  const { data: metrics } = useSWR('/billing/metrics', fetcher);
  const [id, setId] = useState('');
  const [price, setPrice] = useState('');

  const add = async () => {
    await fetch('/billing/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, price: Number(price) }),
    });
    setId('');
    setPrice('');
    mutate();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Billing</h1>
      <div>
        <input placeholder="Plan id" value={id} onChange={e => setId(e.target.value)} />
        <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
        <button onClick={add}>Save</button>
      </div>
      <h2>Plans</h2>
      <ul>
        {plans && plans.map((p: any) => (
          <li key={p.id}>{p.id} - ${p.price}</li>
        ))}
      </ul>
      <h2>Subscribers</h2>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
}
