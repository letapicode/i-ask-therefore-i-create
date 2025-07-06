import { useEffect, useState } from 'react';

export default function Logs() {
  const [logs, setLogs] = useState('');

  useEffect(() => {
    fetch('/artifacts/build.log').then(r => r.text()).then(setLogs);
  }, []);

  return (
    <div>
      <h1>Build Logs</h1>
      <pre>{logs}</pre>
    </div>
  );
}
