import { useState } from 'react';

export default function TutorialBuilder() {
  const [steps, setSteps] = useState<string[]>([]);
  const [text, setText] = useState('');
  return (
    <div>
      <h1>In-App Tutorial Builder</h1>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="step"
      />
      <button
        onClick={() => {
          if (text) {
            setSteps([...steps, text]);
            setText('');
          }
        }}
      >
        Add
      </button>
      <ol>
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
