import { useState } from 'react';

export default function MobilePublish() {
  const [jobId, setJobId] = useState('');
  const [status, setStatus] = useState('');

  const publish = async () => {
    setStatus('');
    const res = await fetch(`/api/publishMobile/${jobId}`, { method: 'POST' });
    if (res.ok) setStatus('Submitted');
    else setStatus('Error');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Publish Mobile App</h1>
      <input
        placeholder="Job ID"
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
      />
      <button onClick={publish}>Publish</button>
      <p>{status}</p>
    </div>
  );
}
