import { useState, useRef } from 'react';

export default function VoiceModeling() {
  const [transcript, setTranscript] = useState('');
  const recRef = useRef<any>();

  const start = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

  return (
    <div style={{ padding: 20 }}>
      <h1>Voice Guided Modeling</h1>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <pre>{transcript}</pre>
    </div>
  );
}
