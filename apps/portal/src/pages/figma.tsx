import { useState } from 'react';

export default function FigmaImport() {
  const [file, setFile] = useState<File | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const submit = () => {
    if (!file) return;
    // In a real implementation this would send the JSON to the backend
    // and convert the design to React components.
    const reader = new FileReader();
    reader.onload = () => {
      console.log('Figma JSON', reader.result);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Figma Design Import</h1>
      <input type="file" accept="application/json" onChange={handleFile} />
      <button onClick={submit} disabled={!file}>Upload</button>
    </div>
  );
}
