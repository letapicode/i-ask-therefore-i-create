import { useState } from 'react';

export default function InferenceDemo() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<number[]>([]);

  const run = async () => {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: input.split(',').map(Number) }),
    });
    const data = await res.json();
    setResult(data.result || []);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Edge Inference Demo</h1>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="1,2,3"
      />
      <button onClick={run}>Predict</button>
      <pre>{JSON.stringify(result)}</pre>
    </div>
  );
}
