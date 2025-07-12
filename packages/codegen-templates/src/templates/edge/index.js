export default {
  async fetch(request) {
    return new Response('hello from the edge', { status: 200 });
  },
};
