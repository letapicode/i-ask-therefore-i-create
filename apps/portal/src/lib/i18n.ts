export async function loadTranslations(lang: string) {
  const res = await fetch(`/locales/${lang}.json`);
  if (!res.ok) return {};
  return res.json();
}
