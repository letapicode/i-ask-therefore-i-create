import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { putItem, getItem, updateItem } from '../../packages/shared/src/dynamo';
import { initSentry } from '../../packages/shared/src/sentry';
import { signMessage, verifyMessage } from '../../packages/shared/src/crypto';

export const app = express();
app.use(express.json());

const USER_TABLE = process.env.USER_TABLE || 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const QS_KEY = process.env.QS_KEY || 'quantum-secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

interface User {
  email: string;
  passwordHash: string;
  verified?: boolean;
  resetToken?: string;
}

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'missing fields' });
  const passwordHash = await bcrypt.hash(password, 10);
  await putItem(USER_TABLE, { email, passwordHash, verified: false });
  res.status(201).json({ ok: true });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'missing fields' });
  const user = await getItem<User>(USER_TABLE, { email });
  if (!user) return res.status(404).json({ error: 'user not found' });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  const signature = signMessage(QS_KEY, token);
  res.json({ token, signature });
});

app.post('/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'missing token' });
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ error: 'invalid token' });
    }
    const email = payload.email;
    let user = await getItem<User>(USER_TABLE, { email });
    if (!user) {
      await putItem(USER_TABLE, {
        email,
        passwordHash: await bcrypt.hash(idToken, 10),
        verified: true,
      });
    }
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    const signature = signMessage(QS_KEY, token);
    res.json({ token, signature });
  } catch (err) {
    res.status(400).json({ error: 'invalid token' });
  }
});

app.post('/verify', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'missing email' });
  await putItem(USER_TABLE, { email, verified: true });
  res.json({ ok: true });
});

app.post('/requestPasswordReset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'missing email' });
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
  await updateItem(USER_TABLE, { email }, 'SET resetToken = :t', {
    ':t': token,
  });
  // In a real system we'd email the token
  res.json({ ok: true, token });
});

app.post('/resetPassword', async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password)
    return res.status(400).json({ error: 'missing fields' });
  const user = await getItem<User>(USER_TABLE, { email });
  if (!user || user.resetToken !== token)
    return res.status(400).json({ error: 'invalid token' });
  const passwordHash = await bcrypt.hash(password, 10);
  await updateItem(
    USER_TABLE,
    { email },
    'SET passwordHash = :p REMOVE resetToken',
    { ':p': passwordHash }
  );
  res.json({ ok: true });
});

app.post('/changeEmail', async (req, res) => {
  const { email, newEmail } = req.body;
  if (!email || !newEmail)
    return res.status(400).json({ error: 'missing fields' });
  const user = await getItem<User>(USER_TABLE, { email });
  if (!user) return res.status(404).json({ error: 'user not found' });
  await putItem(USER_TABLE, { ...user, email: newEmail });
  res.json({ ok: true });
});

app.post('/verifySignature', (req, res) => {
  const { token, signature } = req.body;
  if (!token || !signature)
    return res.status(400).json({ error: 'missing fields' });
  const valid = verifyMessage(QS_KEY, token, signature);
  res.json({ valid });
});

export function start(port = 3000) {
  initSentry('api-auth');
  app.listen(port, () => console.log(`auth listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3000);
}
