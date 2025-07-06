import { useState } from 'react';

export default function Status() {
  const [jobId, setJobId] = useState('');
  const [status, setStatus] = useState('');

  async function checkStatus() {
    const res = await fetch(`http://localhost:3002/api/status/${jobId}`);
    if (res.ok) {
      const data = await res.json();
      setStatus(data.status);
    }
  }

  return (
    <div>
      <h1>Check Job Status</h1>
      <input value={jobId} onChange={e => setJobId(e.target.value)} placeholder="job id" />
      <button onClick={checkStatus}>Check</button>
      {status && <p>Status: {status}</p>}
    </div>
  );
}
