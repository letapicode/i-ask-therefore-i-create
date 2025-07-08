import { useEffect, useState } from 'react';

export default function Logs() {
  const [logs, setLogs] = useState('');
  const [security, setSecurity] = useState('');

  useEffect(() => {
    fetch('/artifacts/build.log').then(r => r.text()).then(setLogs);
    fetch('/artifacts/security.log').then(r => r.text()).then(setSecurity);
  }, []);

  return (
    <div>
      <h1>Build Logs</h1>
      <pre>{logs}</pre>
      <h2>Security Scan</h2>
      <pre>{security}</pre>
    </div>
  );
}
