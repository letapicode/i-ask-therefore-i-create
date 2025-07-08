export interface Plugin {
  name: string;
  /** optional marketplace price */
  price?: number;
  /** tracked purchase count */
  purchaseCount?: number;
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
