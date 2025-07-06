import fetch from 'node-fetch';
import { GenerationOptions } from './openai';

export async function generateWithCustomModel(
  opts: GenerationOptions
): Promise<string> {
  const url = process.env.CUSTOM_MODEL_URL;
  if (!url) {
    throw new Error('CUSTOM_MODEL_URL not configured');
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: opts.description }),
  });
  if (!res.ok) {
    throw new Error(`Custom model request failed: ${res.status}`);
  }
  const data: any = await res.json();
  return data.result || '';
}
