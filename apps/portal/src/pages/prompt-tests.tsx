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

  const reset = async (id: string) => {
    await fetch(`/api/experiments/${id}/reset`, { method: 'POST' });
    mutate();
  };

  const rename = async (id: string, current: string) => {
    const newName = window.prompt('New name', current);
    if (!newName) return;
    await fetch(`/api/experiments/${id}/name`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
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
          <button
            onClick={() => rename(exp.id, exp.name)}
            style={{ marginLeft: 4 }}
          >
            Rename
          </button>
          <div>
            <button onClick={() => record(exp.id, 'A', true)}>A Success</button>
            <button
              onClick={() => record(exp.id, 'B', true)}
              style={{ marginLeft: 4 }}
            >
              B Success
            </button>
          </div>
          <VariantList
            id={exp.id}
            variants={exp.variants}
            mutate={mutate}
          />
          <VariantAdder id={exp.id} mutate={mutate} />
          <a href={`/api/experiments/${exp.id}/export`}>Export CSV</a>
          <button onClick={() => reset(exp.id)} style={{ marginLeft: 4 }}>
            Reset
          </button>
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

function VariantList({
  id,
  variants,
  mutate,
}: {
  id: string;
  variants: Record<string, any>;
  mutate: () => void;
}) {
  const updatePrompt = async (name: string, current: string) => {
    const promptText = window.prompt('New prompt', current);
    if (!promptText) return;
    await fetch(
      `/api/experiments/${id}/variants/${encodeURIComponent(name)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      }
    );
    mutate();
  };

  const remove = async (name: string) => {
    await fetch(
      `/api/experiments/${id}/variants/${encodeURIComponent(name)}`,
      { method: 'DELETE' }
    );
    mutate();
  };

  return (
    <ul style={{ background: '#f0f0f0', padding: 10 }}>
      {Object.entries(variants).map(([name, v]) => (
        <li key={name}>
          <strong>{name}:</strong> {v.prompt} (success {v.success}/{v.total})
          <button
            onClick={() => updatePrompt(name, v.prompt)}
            style={{ marginLeft: 4 }}
          >
            Edit
          </button>
          <button onClick={() => remove(name)} style={{ marginLeft: 4 }}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
