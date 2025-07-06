import { useState } from 'react';

export default function ChatHelper() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const send = () => {
    setMessages([...messages, 'User: ' + input, 'AI: (response)']);
    setInput('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Requirement Assistant</h1>
      <div>
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}
