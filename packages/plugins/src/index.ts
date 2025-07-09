export interface Plugin {
  name: string;
  /** optional price in USD for marketplace purchases */
  price?: number;
  /** total purchases recorded for analytics */
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
