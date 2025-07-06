import { useState, useRef } from 'react';

export default function CreateApp() {
  const [description, setDescription] = useState('');
  const [jobId, setJobId] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('http://localhost:3002/api/createApp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    const data = await res.json();
    setJobId(data.jobId);
  }

  function startVoice() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported');
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(' ');
      setDescription(text);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }

  function stopVoice() {
    recognitionRef.current?.stop();
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>New App</h1>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div>
          <button type="button" onClick={listening ? stopVoice : startVoice}>
            {listening ? 'Stop Voice' : 'Voice Input'}
          </button>
        </div>
        <button type="submit">Create</button>
      </form>
      {jobId && <p>Job submitted: {jobId}</p>}
    </div>
  );
}
