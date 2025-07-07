import { useState, useEffect } from 'react';

export default function Connectors() {
  const [stripeKey, setStripeKey] = useState('');
  const [slackKey, setSlackKey] = useState('');
  const [demoResult, setDemoResult] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/connectors')
      .then((res) => res.json())
      .then((data) => {
        setStripeKey(data.stripeKey || '');
        setSlackKey(data.slackKey || '');
      });
  }, []);

  const save = async () => {
    await fetch('/api/connectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripeKey, slackKey }),
    });
    alert('saved');
  };

  const runDemo = async () => {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: [1, 2, 3] }),
    });
    const data = await res.json();
    setDemoResult(data.result || []);
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
      <hr />
      <h2>Inference Demo</h2>
      <button onClick={runDemo}>Run Prediction</button>
      <pre>{JSON.stringify(demoResult)}</pre>
    </div>
  );
}
