import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

function diff(oldText: string, newText: string): string {
  if (oldText === newText) return 'No changes';
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const out: string[] = [];
  const max = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < max; i++) {
    const o = oldLines[i] || '';
    const n = newLines[i] || '';
    if (o !== n) out.push(`- ${o}\n+ ${n}`);
  }
  return out.join('\n');
}

export default function Prompts() {
  const { data, mutate } = useSWR('/prompt-store/prompts', fetcher);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [edit, setEdit] = useState<Record<string, string>>({});
  const [showDiff, setShowDiff] = useState<Record<string, boolean>>({});

  const create = async () => {
    await fetch('/prompt-store/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, text }),
    });
    setName('');
    setText('');
    mutate();
  };

  const update = async (id: string, current: string) => {
    const newText = edit[id];
    await fetch(`/prompt-store/prompts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText }),
    });
    setShowDiff({ ...showDiff, [id]: false });
    mutate();
  };

  const remove = async (id: string) => {
    await fetch(`/prompt-store/prompts/${id}`, { method: 'DELETE' });
    mutate();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Prompt Management</h1>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Prompt"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={create}>Create</button>
      <ul>
        {data &&
          data.map((p: any) => {
            const latest = p.versions[p.versions.length - 1].text;
            const editVal = edit[p.id] ?? latest;
            return (
              <li key={p.id} style={{ marginTop: 10 }}>
                <strong>{p.name}</strong> v{p.versions.length}
                <br />
                <textarea
                  value={editVal}
                  onChange={(e) => setEdit({ ...edit, [p.id]: e.target.value })}
                />
                <button onClick={() => update(p.id, latest)}>Save</button>
                <button onClick={() => remove(p.id)}>Delete</button>
                <button
                  onClick={() =>
                    setShowDiff({
                      ...showDiff,
                      [p.id]: !showDiff[p.id],
                    })
                  }
                >
                  Diff
                </button>
                {showDiff[p.id] && <pre>{diff(latest, editVal)}</pre>}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
