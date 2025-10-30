import { useEffect, useState } from 'react';
import './profilPage.css';

type User = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
};

type PostItem = {
  id: string;
  title?: string;
  body?: string;
};

const MOCK_USER: User = {
  id: 'mock-user',
  username: 'user123',
  email: 'demo@example.com',
  avatar: 'https://placekitten.com/200/200',
};

const MOCK_POSTS: PostItem[] = [
  {
    id: '1',
    title: 'Mon premier post',
    body: 'Contenu du post de démonstration.',
  },
  {
    id: '2',
    title: 'Un autre post',
    body: 'Encore un post pour remplir la page.',
  },
];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const resUser = await fetch('/api/profile');
        if (!resUser.ok) throw new Error('Impossible de charger le profil');
        const u: User = await resUser.json();
        if (cancelled) return;
        setUser(u);
        setNewName(u.username);

        const resPosts = await fetch(`/api/posts?authorId=${u.id}`);
        if (!resPosts.ok) throw new Error('Impossible de charger les posts');
        const p: PostItem[] = await resPosts.json();
        if (cancelled) return;
        setPosts(p);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (!cancelled) {
          setError(message || 'Erreur inconnue');
          setUser(MOCK_USER);
          setPosts(MOCK_POSTS);
          setNewName(MOCK_USER.username);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (!user && !loading) {
      console.warn('⚠️ Aucun user chargé, utilisation de MOCK_USER par défaut');
      setUser(MOCK_USER);
      return null;
    }
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newName }),
      });
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
      const updated = await res.json();
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('Impossible de sauvegarder le profil');
    }
  };

  if (loading) return <p>Chargement…</p>;
  if (!user) return null;

  return (
    <div className="profile">
      <header className="profile-header">
        <img src={user.avatar} alt="Avatar" className="avatar" />

        <div className="profile-info">
          {isEditing ? (
            <>
              <input
                aria-label="Nom d’utilisateur"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button onClick={handleSave}>Sauvegarder</button>
              <button onClick={() => setIsEditing(false)}>Annuler</button>
            </>
          ) : (
            <>
              <h1 className="username">{user.username}</h1>
              <p className="email">{user.email}</p>
              <button
                onClick={() => setIsEditing(true)}
                aria-label="Modifier le profil"
                className="edit-button"
              >
                Modifier
              </button>
            </>
          )}
        </div>
      </header>

      {error && (
        <div className="banner-error" role="alert">
          {error} — affichage avec données de démonstration
        </div>
      )}

      <section aria-label="Mes posts" className="posts">
        <h2>Mes posts</h2>
        {posts.length === 0 && <p>Aucun post pour le moment.</p>}
        <div className="post-list">
          {posts.map((p) => (
            <article key={p.id} className="post">
              {p.title && <h3 className="post-title">{p.title}</h3>}
              {p.body && <p className="post-body">{p.body}</p>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
