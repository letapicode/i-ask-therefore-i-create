# Retry Utility

This package provides a simple async `retry` function used to repeat failed tasks.

```
import { retry } from 'retry';

await retry(() => doSomething(), 5, 1000);
```
