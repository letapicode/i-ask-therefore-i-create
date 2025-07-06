import { templates } from './templates';

export function registerTemplate(t: { name: string; description: string }) {
  templates.push(t);
}
