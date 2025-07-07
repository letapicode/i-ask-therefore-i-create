export function figmaToReact(data: any): string {
  const nodes = data?.document?.children || [];
  const children = nodes.map((n: any) => `<div>${n.name}</div>`).join('\n  ');
  return `import React from 'react';

export default function Generated() {
  return (
    <div>
      ${children}
    </div>
  );
}
`;
}
