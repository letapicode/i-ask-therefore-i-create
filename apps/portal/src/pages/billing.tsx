import { useEffect, useState } from 'react';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Billing() {
  const [plans, setPlans] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('');

  useEffect(() => {
    fetcher('/billing/plans').then(setPlans);
    fetcher('/billing/invoices').then(setInvoices);
  }, []);

  const subscribe = async () => {
    await fetch('/billing/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, plan }),
    });
    alert('subscription created');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Billing</h1>
      <div>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <select value={plan} onChange={e => setPlan(e.target.value)}>
          <option value="">Select plan</option>
          {plans.map(p => (
            <option key={p.id} value={p.id}>
              {p.id} - ${p.price / 100}
            </option>
          ))}
        </select>
        <button onClick={subscribe}>Subscribe</button>
      </div>
      <h2>Invoices</h2>
      <ul>
        {invoices.map((inv: any) => (
          <li key={inv.id}>
            {inv.email} - ${inv.amount / 100}
          </li>
        ))}
      </ul>
    </div>
  );
}
