import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_URL);

// Server-side we won't persist auth to disk; we'll use a per-request instance or clone.
export function pbForToken(token?: string) {
  const client = new PocketBase(pb.baseUrl);
  if (token) client.authStore.save(token, null); // attach bearer token
  return client;
}

export default pb;
