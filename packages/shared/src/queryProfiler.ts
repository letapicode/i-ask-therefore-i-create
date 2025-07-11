import fetch from 'node-fetch';

const SERVICE_URL = process.env.QUERY_OPTIMIZER_URL || 'http://localhost:3015';

export async function recordQuery(
  appId: string,
  query: string,
  duration: number
) {
  try {
    await fetch(`${SERVICE_URL}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, query, duration }),
    });
  } catch {
    // ignore errors
  }
}
