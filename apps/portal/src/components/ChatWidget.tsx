import { useEffect, useRef, useState } from 'react';

export default function ChatWidget() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002/chat');
    wsRef.current = ws;
    ws.onmessage = (e) => {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: e.data as string },
      ]);
    };
    return () => ws.close();
  }, []);

  const send = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(input);
    setMessages((m) => [...m, { role: 'user', content: input }]);
    setInput('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: 300,
        background: '#fff',
        border: '1px solid #ccc',
        padding: 8,
      }}
    >
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.role === 'user' ? 'You' : 'AI'}:</b> {m.content}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        style={{ width: '100%' }}
      />
      <button onClick={send}>Send</button>
    </div>
  );
}
