# Plugins

This package defines a simple plugin interface so third parties can extend the system.

```ts
export interface Plugin {
  name: string;
  /** optional price in USD for marketplace purchases */
  price?: number;
  /** total purchases recorded for analytics */
  purchaseCount?: number;
  init(): void | Promise<void>;
}
```

Plugins register themselves using `register(plugin)` and are looked up at runtime.
A sample plugin is provided in `src/sample.ts`.
