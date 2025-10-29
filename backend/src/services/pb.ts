import PocketBase from 'pocketbase';

const pb = new PocketBase(
  process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
);

// juste un exemple il faut Crée ton compte admin sur pocketbase (login + mot de passe).
export async function getAllPosts() {
  const records = await pb.collection('posts').getFullList();
  return records;
}

export default pb;
