import { useState, useRef, useEffect } from 'react';

interface Table {
  name: string;
  fields: { name: string; type: string }[];
}

export default function VoiceModeling() {
  const [transcript, setTranscript] = useState('');
  const [tables, setTables] = useState<Table[]>([]);
  const recRef = useRef<any>();

  function parse(text: string): Table[] {
    const words = text.toLowerCase().split(/\s+/);
    const result: Table[] = [];
    let i = 0;
    while (i < words.length) {
      if (words[i] === 'table') {
        const name = words[i + 1];
        i += 2;
        const fields: { name: string; type: string }[] = [];
        while (i < words.length && words[i] !== 'table') {
          const field = words[i];
          const type = words[i + 1] || 'string';
          fields.push({ name: field, type });
          i += 2;
        }
        result.push({ name, fields });
      } else {
        i++;
      }
    }
    return result;
  }

  const start = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech API not supported');
    const rec = new SpeechRecognition();
    rec.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(' ');
      setTranscript(text);
    };
    recRef.current = rec;
    rec.start();
  };

  const stop = () => recRef.current?.stop();

  useEffect(() => {
    const parsed = parse(transcript);
    setTables(parsed);
  }, [transcript]);

  const save = async () => {
    await fetch('/api/schema', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tables }),
    });
    alert('schema saved');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Voice Guided Modeling</h1>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <pre>{transcript}</pre>
      <pre>{JSON.stringify(tables, null, 2)}</pre>
      <button onClick={save}>Save Schema</button>
    </div>
  );
}
