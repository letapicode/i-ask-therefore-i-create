import { useState, useEffect } from 'react';

export default function Connectors() {
  const [stripeKey, setStripeKey] = useState('');
  const [slackKey, setSlackKey] = useState('');
  const [shopifyKey, setShopifyKey] = useState('');
  const [quickbooksKey, setQuickbooksKey] = useState('');
  const [zendeskKey, setZendeskKey] = useState('');
  const [demoResult, setDemoResult] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/connectors')
      .then((res) => res.json())
      .then((data) => {
        setStripeKey(data.stripeKey || '');
        setSlackKey(data.slackKey || '');
        setShopifyKey(data.shopifyKey || '');
        setQuickbooksKey(data.quickbooksKey || '');
        setZendeskKey(data.zendeskKey || '');
      });
  }, []);

  const save = async () => {
    await fetch('/api/connectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stripeKey,
        slackKey,
        shopifyKey,
        quickbooksKey,
        zendeskKey,
      }),
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
      <div>
        <input
          placeholder="Shopify Key"
          value={shopifyKey}
          onChange={(e) => setShopifyKey(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="QuickBooks Key"
          value={quickbooksKey}
          onChange={(e) => setQuickbooksKey(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="Zendesk Key"
          value={zendeskKey}
          onChange={(e) => setZendeskKey(e.target.value)}
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
