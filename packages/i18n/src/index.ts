import fs from 'fs';

export function loadLocale(lang: string): Record<string, string> {
  const path = `packages/i18n/locales/${lang}.json`;
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

export function t(key: string, lang: string, fallback: string = ''): string {
  const dict = loadLocale(lang);
  return dict[key] || fallback || key;
}
