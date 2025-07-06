import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { putItem, getItem } from "../../packages/shared/src/dynamo";
import { initSentry } from "../../packages/shared/src/sentry";

export const app = express();
app.use(express.json());

const USER_TABLE = process.env.USER_TABLE || "users";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface User {
  email: string;
  passwordHash: string;
  verified?: boolean;
}

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing fields' });
  const passwordHash = await bcrypt.hash(password, 10);
  await putItem(USER_TABLE, { email, passwordHash, verified: false });
  res.status(201).json({ ok: true });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing fields' });
  const user = await getItem<User>(USER_TABLE, { email });
  if (!user) return res.status(404).json({ error: 'user not found' });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.post('/verify', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'missing email' });
  await putItem(USER_TABLE, { email, verified: true });
  res.json({ ok: true });
});

export function start(port = 3000) {
  initSentry('api-auth');
  app.listen(port, () => console.log(`auth listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3000);
}

