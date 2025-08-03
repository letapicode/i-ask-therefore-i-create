import { escape } from 'validator';

/**
 * HTML-escapes a string to guard against injection attacks.
 */
export function sanitize(input: string): string {
  return escape(input);
}

/**
 * Recursively sanitizes all string fields within an object or array.
 * Non-string values are returned as-is. Useful for cleaning user supplied
 * payloads before persistence.
 */
export function sanitizeObject<T>(value: T): T {
  if (typeof value === 'string') {
    return sanitize(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeObject(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const result: any = {};
    for (const [key, val] of Object.entries(value as any)) {
      result[key] = sanitizeObject(val);
    }
    return result;
  }
  return value;
}
