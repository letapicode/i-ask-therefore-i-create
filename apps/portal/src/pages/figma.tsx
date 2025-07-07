import { useState } from 'react';

export default function FigmaImport() {
  const [file, setFile] = useState<File | null>(null);
  const [code, setCode] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const submit = async () => {
    if (!file) return;
    const text = await file.text();
    const res = await fetch('/api/figma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: text,
    });
    const data = await res.json();
    setCode(data.code);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Figma Design Import</h1>
      <input type="file" accept="application/json" onChange={handleFile} />
      <button onClick={submit} disabled={!file}>Upload</button>
      {code && (
        <div>
          <h2>Generated Component</h2>
          <pre>{code}</pre>
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(code)}`}
            download="Generated.tsx"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}
