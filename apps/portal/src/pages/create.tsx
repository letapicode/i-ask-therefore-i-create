import { useState } from 'react';

export default function CreateApp() {
  const [description, setDescription] = useState('');
  const [jobId, setJobId] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('http://localhost:3002/api/createApp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    const data = await res.json();
    setJobId(data.jobId);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>New App</h1>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      {jobId && <p>Job submitted: {jobId}</p>}
    </div>
  );
}
