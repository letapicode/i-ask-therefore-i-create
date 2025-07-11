export const piiFieldPatterns = [
  /email/i,
  /password/i,
  /phone/i,
  /address/i,
  /ssn/i,
  /name/i,
];

export function isPiiField(field: string): boolean {
  return piiFieldPatterns.some((re) => re.test(field));
}

export function anonymizeObject<T extends Record<string, any>>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((o) => anonymizeObject(o)) as unknown as T;
  }
  if (obj && typeof obj === 'object') {
    const copy: any = { ...obj };
    for (const key of Object.keys(copy)) {
      if (isPiiField(key)) {
        copy[key] = '[REDACTED]';
      } else if (typeof copy[key] === 'object') {
        copy[key] = anonymizeObject(copy[key]);
      }
    }
    return copy;
  }
  return obj;
}
