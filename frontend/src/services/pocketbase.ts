import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Garde la session active après refresh
pb.authStore.loadFromCookie(document.cookie || '');
pb.authStore.onChange(() => {
  document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
});

export default pb;
