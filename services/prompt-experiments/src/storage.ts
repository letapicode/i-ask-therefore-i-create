import fs from 'fs/promises';
import type { Experiment } from './types';

const DB_FILE = process.env.EXPERIMENT_DB || '.prompt-experiments.json';

let cache: Experiment[] | null = null;
let mutex = Promise.resolve();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
  let release: (() => void) | undefined;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  const previous = mutex;
  mutex = mutex.then(() => wait);
  await previous;
  try {
    return await fn();
  } finally {
    release?.();
  }
}

async function loadFromDisk(): Promise<Experiment[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    cache = JSON.parse(raw) as Experiment[];
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') {
      cache = [];
    } else {
      throw err;
    }
  }
  return cache!;
}

export async function readExperiments(): Promise<Experiment[]> {
  return runExclusive(async () => clone(await loadFromDisk()));
}

export async function mutateExperiments<T>(
  mutator: (experiments: Experiment[]) => T | Promise<T>
): Promise<{ result: T; experiments: Experiment[] }> {
  return runExclusive(async () => {
    const current = clone(await loadFromDisk());
    const result = await mutator(current);
    await fs.writeFile(DB_FILE, JSON.stringify(current, null, 2));
    cache = current;
    return { result, experiments: clone(current) };
  });
}

export async function overwriteExperiments(data: Experiment[]): Promise<void> {
  await runExclusive(async () => {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
    cache = clone(data);
  });
}

export function clearExperimentCache() {
  cache = null;
}
