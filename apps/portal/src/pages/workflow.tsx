import { useState, useEffect } from 'react';

export default function Workflow() {
  const [data, setData] = useState('{}');

  useEffect(() => {
    fetch('/api/workflow')
      .then((r) => r.json())
      .then((d) => setData(JSON.stringify(d, null, 2)));
  }, []);

  const save = async () => {
    await fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Workflow Builder</h1>
      <textarea
        value={data}
        onChange={(e) => setData(e.target.value)}
        rows={10}
        cols={50}
      />
      <br />
      <button onClick={save}>Save</button>
    </div>
  );
}
