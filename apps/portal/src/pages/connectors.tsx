import { useState, useEffect } from 'react';

export default function Connectors() {
  const [stripeKey, setStripeKey] = useState('');
  const [slackKey, setSlackKey] = useState('');
  const [shopifyKey, setShopifyKey] = useState('');
  const [quickbooksKey, setQuickbooksKey] = useState('');
  const [zendeskKey, setZendeskKey] = useState('');
  const [kafkaBrokers, setKafkaBrokers] = useState('');
  const [kafkaTopic, setKafkaTopic] = useState('');
  const [kinesisStream, setKinesisStream] = useState('');
  const [kinesisRegion, setKinesisRegion] = useState('');
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
        setKafkaBrokers(data.kafkaBrokers || '');
        setKafkaTopic(data.kafkaTopic || '');
        setKinesisStream(data.kinesisStream || '');
        setKinesisRegion(data.kinesisRegion || '');
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
        kafkaBrokers,
        kafkaTopic,
        kinesisStream,
        kinesisRegion,
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
      <div>
        <input
          placeholder="Kafka Brokers"
          value={kafkaBrokers}
          onChange={(e) => setKafkaBrokers(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="Kafka Topic"
          value={kafkaTopic}
          onChange={(e) => setKafkaTopic(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="Kinesis Stream"
          value={kinesisStream}
          onChange={(e) => setKinesisStream(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="Kinesis Region"
          value={kinesisRegion}
          onChange={(e) => setKinesisRegion(e.target.value)}
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
