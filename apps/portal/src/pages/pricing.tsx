import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Pricing() {
  const [cpu, setCpu] = useState('10');
  const [memory, setMemory] = useState('20');
  const [regions, setRegions] = useState('us-east-1,us-central1,eastus');
  const [failover, setFailover] = useState(false);
  const { data } = useSWR(
    `/pricing/recommend?cpu=${cpu}&memory=${memory}&regions=${regions}&failover=${failover}`,
    fetcher
  );
  return (
    <div style={{ padding: 20 }}>
      <h1>Multi-Cloud Pricing Advisor</h1>
      <div>
        <label>
          CPU Hours
          <input value={cpu} onChange={e => setCpu(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Memory GB Hours
          <input value={memory} onChange={e => setMemory(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Regions (comma separated)
          <input value={regions} onChange={e => setRegions(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Failover
          <input
            type="checkbox"
            checked={failover}
            onChange={e => setFailover(e.target.checked)}
          />
        </label>
      </div>
      {data && (
        <p style={{ marginTop: 20 }}>
          Cheapest option: {data.recommendation.provider} in{' '}
          {data.recommendation.region} costing ${'{'}data.recommendation.cost.toFixed(2){'}'}
        </p>
      )}
    </div>
  );
}
