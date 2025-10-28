import { useEffect, useState } from "react";

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

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [Post, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const resUser = await fetch("/api/profile");
        if (!resUser.ok) throw new Error("Impossible de charger le profil");
        const u: User = await resUser.json();
        if (cancelled) return;
        setUser(u);

        const resPosts = await fetch(`/api/posts?authorId=${u.id}`);
        if (!resPosts.ok) throw new Error("Impossible de charger les posts");
        const p: PostItem[] = await resPosts.json();
        if (cancelled) return;
        setPosts(p);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Erreur inconnue");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Chargement…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 720, margin: "32px auto", padding: 16 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img
          src={user.avatar}
          alt="Avatar"
          width={96}
          height={96}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
        <div>
          <h1 style={{ margin: 0 }}>{user.username}</h1>
          <p style={{ margin: 0 }}>{user.email}</p>
        </div>
      </header>

      <section
        aria-label="Mes posts"
        style={{ marginTop: 24, display: "grid", gap: 12 }}
      >
        {/* {posts.map((p) => (
          <Post key={p.id} id={p.id} />
        ))} */}
      </section>
    </div>
  );
}
