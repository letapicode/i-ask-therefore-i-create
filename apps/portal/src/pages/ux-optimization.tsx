import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function UxOptimization() {
  const { data, mutate } = useSWR('/analytics/uxSuggestions', fetcher);
  const [preview, setPreview] = useState<string | null>(null);

  const apply = async (id: string) => {
    await fetch(`/analytics/uxSuggestions/${id}/apply`, { method: 'POST' });
    mutate();
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>UI/UX Suggestions</h1>
      {data.map((s: any) => (
        <div key={s.id} style={{ marginBottom: 10 }}>
          <p>{s.text}</p>
          <button onClick={() => setPreview(s.id)}>Preview</button>
          <button onClick={() => apply(s.id)} style={{ marginLeft: 4 }}>
            Adopt
          </button>
          {preview === s.id && (
            <div style={{ border: '1px solid #ccc', padding: 10, marginTop: 5 }}>
              <p>(preview not available)</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
