addEventListener('fetch', (event) => {
  event.respondWith(new Response('hello from the edge'));
});
