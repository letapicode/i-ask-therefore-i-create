import express from "express";
import fs from "fs";
import { initSentry } from "../../packages/shared/src/sentry";

const app = express();
app.use(express.json());

const DB_FILE = process.env.EVENT_DB || ".events.json";

function readEvents(): any[] {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveEvents(events: any[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(events, null, 2));
}

app.post("/events", (req, res) => {
  const events = readEvents();
  events.push({ ...req.body, time: Date.now() });
  saveEvents(events);
  res.status(201).json({ ok: true });
});

app.get("/metrics", (_req, res) => {
  const events = readEvents();
  res.json({ count: events.length });
});

export function start(port = 3001) {
  initSentry('analytics');
  app.listen(port, () => console.log(`analytics listening on ${port}`));
}

if (require.main === module) {
  start(Number(process.env.PORT) || 3001);
}
