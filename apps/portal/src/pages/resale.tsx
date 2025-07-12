import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Resale() {
  const { data, mutate } = useSWR('/plugins/listings', fetcher);
  const [plugin, setPlugin] = useState('');
  const [licenseKey, setKey] = useState('');
  const [seller, setSeller] = useState('');
  const [price, setPrice] = useState('');
  const [buyerKeys, setBuyer] = useState<Record<string, string>>({});

  const list = async () => {
    await fetch('/plugins/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plugin, licenseKey, seller, price: Number(price) }),
    });
    setPlugin('');
    setKey('');
    setSeller('');
    setPrice('');
    mutate();
  };

  const buy = async (p: string, key: string) => {
    const b = buyerKeys[p] || '';
    const res = await fetch('/plugins/purchase-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plugin: p, licenseKey: key, buyer: b }),
    });
    if (res.status === 201) mutate();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Plugin Resale Marketplace</h1>
      <input placeholder="Plugin" value={plugin} onChange={e => setPlugin(e.target.value)} />
      <input placeholder="License" value={licenseKey} onChange={e => setKey(e.target.value)} />
      <input placeholder="Seller" value={seller} onChange={e => setSeller(e.target.value)} />
      <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
      <button onClick={list}>List for Sale</button>
      <ul>
        {data && data.map((l: any, i: number) => (
          <li key={i}>
            {l.plugin} - ${l.price} from {l.seller}
            <input
              placeholder="Buyer"
              value={buyerKeys[l.plugin] || ''}
              onChange={e => setBuyer({ ...buyerKeys, [l.plugin]: e.target.value })}
            />
            <button onClick={() => buy(l.plugin, l.licenseKey)}>Buy</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
