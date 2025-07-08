import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function CollabEditor({ value, onChange }: Props) {
  const [cursors, setCursors] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket>();
  const userId = useRef(`u-${Math.random().toString(36).slice(2, 8)}`);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', userId: userId.current }));
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'update') {
          onChange(msg.data);
        } else if (msg.type === 'cursors') {
          setCursors(msg.data);
        } else if (msg.type === 'init') {
          onChange(msg.data);
          setCursors(msg.cursors || {});
        }
      } catch {
        // ignore
      }
    };
    return () => ws.close();
  }, [onChange]);

  const sendUpdate = (text: string) => {
    onChange(text);
    const pos = textareaRef.current?.selectionStart || 0;
    wsRef.current?.send(
      JSON.stringify({
        type: 'update',
        data: text,
        cursor: pos,
      })
    );
  };

  const sendCursor = () => {
    const pos = textareaRef.current?.selectionStart || 0;
    wsRef.current?.send(
      JSON.stringify({ type: 'cursor', cursor: pos })
    );
  };

  return (
    <div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => sendUpdate(e.target.value)}
        onKeyUp={sendCursor}
        onClick={sendCursor}
        style={{ width: '100%', minHeight: 120 }}
      />
      <div style={{ fontSize: 12, marginTop: 4 }}>
        Active cursors:
        {Object.entries(cursors).map(([u, p]) => (
          <span key={u} style={{ marginLeft: 8 }}>
            {u}@{p}
          </span>
        ))}
      </div>
    </div>
  );
}
