import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function PromptTests() {
  const { data, mutate } = useSWR('/api/experiments', fetcher, {
    refreshInterval: 2000,
  });
  const [name, setName] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const create = async () => {
    await fetch('/api/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        variants: { A: { prompt: a }, B: { prompt: b } },
      }),
    });
    setName('');
    setA('');
    setB('');
    mutate();
  };

  const record = async (id: string, variant: string, success: boolean) => {
    await fetch(`/api/experiments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant, success }),
    });
    mutate();
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Prompt Experiments</h1>
      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Variant A"
          value={a}
          onChange={(e) => setA(e.target.value)}
          style={{ marginLeft: 4 }}
        />
        <input
          placeholder="Variant B"
          value={b}
          onChange={(e) => setB(e.target.value)}
          style={{ marginLeft: 4 }}
        />
        <button onClick={create} style={{ marginLeft: 4 }}>
          Create
        </button>
      </div>
      {data.map((exp: any) => (
        <div key={exp.id} style={{ marginBottom: 10 }}>
          <strong>{exp.name}</strong>{' '}
          {exp.winner && <span>(winner: {exp.winner})</span>}
          <div>
            <button onClick={() => record(exp.id, 'A', true)}>A Success</button>
            <button
              onClick={() => record(exp.id, 'B', true)}
              style={{ marginLeft: 4 }}
            >
              B Success
            </button>
          </div>
          <pre style={{ background: '#f0f0f0', padding: 10 }}>
            {JSON.stringify(exp.variants, null, 2)}
          </pre>
          <VariantAdder id={exp.id} mutate={mutate} />
          <a href={`/api/experiments/${exp.id}/export`}>Export CSV</a>
        </div>
      ))}
    </div>
  );
}

function VariantAdder({ id, mutate }: { id: string; mutate: () => void }) {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');

  const add = async () => {
    await fetch(`/api/experiments/${id}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, prompt }),
    });
    setName('');
    setPrompt('');
    mutate();
  };

  return (
    <div style={{ marginTop: 4 }}>
      <input
        placeholder="Variant name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ marginLeft: 4 }}
      />
      <button onClick={add} style={{ marginLeft: 4 }}>
        Add Variant
      </button>
    </div>
  );
}
