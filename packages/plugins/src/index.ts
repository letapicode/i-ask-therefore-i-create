export interface Plugin {
  name: string;
  init(): void | Promise<void>;
}

export type PluginRegistry = Record<string, Plugin>;

const registry: PluginRegistry = {};

export function register(plugin: Plugin) {
  registry[plugin.name] = plugin;
  plugin.init();
}

export function getPlugin(name: string): Plugin | undefined {
  return registry[name];
}
