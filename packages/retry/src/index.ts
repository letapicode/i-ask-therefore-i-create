/**
 * Retry a promise-returning function a specified number of times.
 *
 * @param fn       Function to invoke.
 * @param attempts Number of attempts before failing.
 * @param delayMs  Initial delay between attempts in milliseconds.
 * @param factor   Multiplier used for exponential backoff. Defaults to `1` (no backoff).
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 500,
  factor = 1
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        const backoff = delayMs * Math.pow(factor, i);
        await new Promise(res => setTimeout(res, backoff));
      }
    }
  }
  throw lastError;
}
