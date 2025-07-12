import fetch from 'node-fetch';
import { Schema } from '../../migrations/src';

export interface SeedOptions {
  schema: Schema;
  rows: number;
}

export async function generateSeedData(opts: SeedOptions): Promise<any[]> {
  const { schema, rows } = opts;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];
  const prompt = `Generate ${rows} JSON records matching this schema: ${JSON.stringify(schema)}`;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data: any = await res.json();
  try {
    return JSON.parse(data.choices?.[0]?.message?.content || '[]');
  } catch {
    return [];
  }
}
