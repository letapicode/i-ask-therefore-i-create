import { execFile } from 'child_process';
import { promisify } from 'util';
import { GenerationOptions } from './openai';

const exec = promisify(execFile);

export async function generateWithLocalModel(opts: GenerationOptions): Promise<string> {
  const modelPath = process.env.LOCAL_MODEL_PATH || 'offline-model/model';
  const script = process.env.LOCAL_MODEL_SCRIPT || 'offline-model/infer.py';
  const { stdout } = await exec('python', [script, '--model', modelPath, '--prompt', opts.description, '--lang', opts.language]);
  return stdout.trim();
}
