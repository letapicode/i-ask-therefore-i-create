import { useEffect, useState } from 'react';

export default function A11yTips({ project }: { project: string }) {
  const [tips, setTips] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/a11yTips?project=${encodeURIComponent(project)}`);
        if (res.ok) {
          const data = await res.json();
          setTips(data.tips.map((t: any) => t.text));
        }
      } catch {
        // ignore fetch errors
      }
    }
    load();
  }, [project]);

  if (tips.length === 0) return null;

  return (
    <aside style={{ border: '1px solid #ccc', padding: 8, marginTop: 10 }}>
      <h3>Accessibility Tips</h3>
      <ul>
        {tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </aside>
  );
}
