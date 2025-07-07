import { useState } from 'react';

export default function Connectors() {
  const [stripeKey, setStripeKey] = useState('');
  const [slackKey, setSlackKey] = useState('');

  const save = async () => {
    await fetch('/api/connectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripeKey, slackKey }),
    });
    alert('saved');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Data Connectors</h1>
      <div>
        <input
          placeholder="Stripe Key"
          value={stripeKey}
          onChange={(e) => setStripeKey(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="Slack Key"
          value={slackKey}
          onChange={(e) => setSlackKey(e.target.value)}
        />
      </div>
      <button onClick={save}>Save</button>
    </div>
  );
}
