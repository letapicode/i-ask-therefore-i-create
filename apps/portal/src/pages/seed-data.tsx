import { useState } from 'react';

export default function SeedData() {
  const [jobId, setJobId] = useState('');
  const [rows, setRows] = useState(5);
  const [status, setStatus] = useState('');

  const run = async () => {
    setStatus('');
    const res = await fetch(`/api/seedData/${jobId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    });
    const data = await res.json();
    if (res.ok) setStatus(`Inserted ${data.inserted}`);
    else setStatus(data.error || 'Error');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Generate Seed Data</h1>
      <div>
        <input
          placeholder="Job ID"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
        />
      </div>
      <div>
        <input
          type="number"
          value={rows}
          onChange={(e) => setRows(parseInt(e.target.value, 10))}
        />
      </div>
      <button onClick={run}>Generate</button>
      <p>{status}</p>
    </div>
  );
}
