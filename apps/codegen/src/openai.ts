import fetch from 'node-fetch';
import { generateWithCustomModel } from './customModel';
import { generateWithLocalModel } from './localModel';

export interface GenerationOptions {
  description: string;
  language: string;
}

export async function generateCode(opts: GenerationOptions): Promise<string> {
  if (process.env.LOCAL_MODEL_PATH) {
    return generateWithLocalModel(opts);
  }
  if (process.env.CUSTOM_MODEL_URL) {
    return generateWithCustomModel(opts);
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Generate a ${opts.language} project for: ${opts.description}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI request failed: ${res.status}`);
  }
  const data: any = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
