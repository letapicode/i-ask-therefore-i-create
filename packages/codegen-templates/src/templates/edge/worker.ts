const ANALYTICS_URL = (globalThis as any).ANALYTICS_URL || '';

addEventListener('fetch', (event) => {
  event.respondWith(handle(event.request));
});

async function handle(request: Request): Promise<Response> {
  if (ANALYTICS_URL) {
    fetch(`${ANALYTICS_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'edgeRequest', path: new URL(request.url).pathname }),
    }).catch(() => {});
  }
  return new Response('hello from the edge');
}
