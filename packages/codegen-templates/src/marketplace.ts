import { templates } from './templates';

export type TemplateHook = (schema: string) => string;

const hooks: Record<string, TemplateHook[]> = {};

export function registerTemplate(
  t: { name: string; description: string },
  hook?: TemplateHook
) {
  templates.push(t);
  if (hook) {
    hooks[t.name] = hooks[t.name] || [];
    hooks[t.name].push(hook);
  }
}

export function runTemplateHooks(name: string, schema: string): string {
  const list = hooks[name] || [];
  return list.reduce((s, fn) => fn(s), schema);
}
