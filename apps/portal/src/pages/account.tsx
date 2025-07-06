import { useState } from 'react';

export default function Account() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function update() {
    await fetch('/api/auth/changeEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newEmail: email }),
    });
    if (password) {
      await fetch('/api/auth/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: '', password }),
      });
    }
    alert('Updated');
  }

  return (
    <div>
      <h1>Account Settings</h1>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="New password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={update}>Save</button>
    </div>
  );
}
