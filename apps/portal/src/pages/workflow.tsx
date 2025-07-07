import { useState, useEffect } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'react-flow-renderer';

export default function Workflow() {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/workflow')
      .then((r) => r.json())
      .then((d) => setElements(d.nodes || []));
  }, []);

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
