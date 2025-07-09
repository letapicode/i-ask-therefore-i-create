import { useState, useEffect } from 'react';

interface Msg { role: 'user' | 'ai'; text: string; }

export default function PairProgramming() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4002');
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'response') {
        setMessages((m) => [...m, { role: 'ai', text: data.text }]);
      }
    };
    setWs(socket);
    return () => socket.close();
  }, []);

  const send = () => {
    if (!ws) return;
    ws.send(JSON.stringify({ type: 'ask', file, message: input }));
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
  };

  async function applyPatch(text: string) {
    const match = text.match(/```diff([\s\S]*?)```/);
    if (!match) return;
    await fetch('http://localhost:4002/applyPatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patch: match[1].trim() }),
    });
    alert('Patch applied');
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Pair Programming Chat</h1>
      <input
        placeholder="File path"
        value={file}
        onChange={(e) => setFile(e.target.value)}
        style={{ width: '100%' }}
      />
      <div style={{ marginTop: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: 5 }}>
            <b>{m.role === 'user' ? 'You' : 'AI'}:</b> {m.text}
            {m.role === 'ai' && m.text.includes('```diff') && (
              <button onClick={() => applyPatch(m.text)}>Apply Patch</button>
            )}
          </div>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', height: 80 }}
      />
      <button onClick={send}>Send</button>
    </div>
  );
}
