import { useState, useEffect, useRef } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'react-flow-renderer';

export default function Workflow() {
  const [elements, setElements] = useState<any[]>([]);
  const wsRef = useRef<WebSocket>();
  const ignoreRef = useRef(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4001');
    wsRef.current = ws;
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'init' || msg.type === 'update') {
          ignoreRef.current = true;
          setElements(msg.data.nodes || []);
        }
      } catch {
        // ignore parse errors
      }
    };
    ws.onerror = () => {
      // fall back to HTTP if websocket fails
      fetch('/api/workflow')
        .then((r) => r.json())
        .then((d) => setElements(d.nodes || []));
    };
    return () => ws.close();
  }, []);

  const save = async () => {
    await fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: elements }),
    });
  };

  const update = (els: any[]) => {
    setElements(els);
    if (ignoreRef.current) {
      ignoreRef.current = false;
      return;
    }
    wsRef.current?.send(
      JSON.stringify({ type: 'update', data: { nodes: els } })
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Workflow Builder</h1>
      <div style={{ height: 400 }}>
        <ReactFlow
          elements={elements}
          onElementsRemove={update}
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
