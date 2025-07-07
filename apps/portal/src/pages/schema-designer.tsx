import { useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'react-flow-renderer';

export default function SchemaDesigner() {
  const [elements, setElements] = useState<any[]>([]);

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <h1>Schema Designer</h1>
      <ReactFlow elements={elements} onElementsRemove={setElements} onLoad={() => {}}>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
