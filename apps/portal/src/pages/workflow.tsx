import { useState, useEffect, useRef } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'react-flow-renderer';

export default function Workflow() {
  const [elements, setElements] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const fromRemote = useRef(false);

  useEffect(() => {
    fetch('/api/workflow')
      .then((r) => r.json())
      .then((d) => setElements(d.nodes || []));
    const url = process.env.NEXT_PUBLIC_COLLAB_SERVER || 'ws://localhost:4001';
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onmessage = (evt) => {
      try {
        const { type, data } = JSON.parse(evt.data);
        if (type === 'init') {
          fromRemote.current = true;
          setElements(data.nodes || []);
        } else if (type === 'update') {
          fromRemote.current = true;
          setElements(data);
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (!wsRef.current || fromRemote.current) {
      fromRemote.current = false;
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'update', data: elements }));
  }, [elements]);

  const save = async () => {
    await fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: elements }),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Workflow Builder</h1>
      <div style={{ height: 400 }}>
        <ReactFlow
          elements={elements}
          onElementsRemove={setElements}
          onLoad={() => {}}
        />
        <MiniMap />
        <Controls />
        <Background />
      </div>
      <button onClick={save}>Save</button>
    </div>
  );
}
