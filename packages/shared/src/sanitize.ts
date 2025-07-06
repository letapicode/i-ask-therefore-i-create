import { escape } from 'validator';

export function sanitize(input: string): string {
  return escape(input);
}
