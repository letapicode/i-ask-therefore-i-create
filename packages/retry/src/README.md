# Retry Utility

This package provides a simple async `retry` function used to repeat failed tasks.

```
import { retry } from 'retry';

// retry up to 5 times with exponential backoff (1000ms, then 2000ms, ...)
await retry(() => doSomething(), 5, 1000, 2);
```
