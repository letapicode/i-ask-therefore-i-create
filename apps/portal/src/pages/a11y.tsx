import { useState } from 'react';

export default function A11y() {
  const [path, setPath] = useState('');
  const [report, setReport] = useState<any>(null);

  const scan = async () => {
    const res = await fetch('/api/a11yReport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    const data = await res.json();
    setReport(data);
  };

  const markFixed = (id: string) => {
    if (!report) return;
    setReport({
      ...report,
      violations: report.violations.filter((v: any) => v.id !== id),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Accessibility Report</h1>
      <input
        placeholder="index.html"
        value={path}
        onChange={(e) => setPath(e.target.value)}
      />
      <button onClick={scan}>Scan</button>
      {report && (
        <ul>
          {report.violations.map((v: any) => (
            <li key={v.id} style={{ marginTop: 10 }}>
              {v.help}
              <button onClick={() => markFixed(v.id)} style={{ marginLeft: 10 }}>
                Mark Fixed
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

