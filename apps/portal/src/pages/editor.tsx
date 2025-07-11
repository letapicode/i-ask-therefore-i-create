import { useState } from 'react';
import A11yTips from '../components/A11yTips';

export default function Editor() {
  const [project, setProject] = useState('demo');

  return (
    <div style={{ padding: 20 }}>
      <h1>Editor</h1>
      <input
        value={project}
        onChange={(e) => setProject(e.target.value)}
        placeholder="project"
        style={{ marginBottom: 10 }}
      />
      <A11yTips project={project} />
    </div>
  );
}
