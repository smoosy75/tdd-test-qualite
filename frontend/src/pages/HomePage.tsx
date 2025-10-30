import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function getUser() {
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:3000/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await res.json();
      setUser(data.user);
    }

    getUser();
  }, []);

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>✅ Connexion réussie !</h1>
      <h2>Bienvenue sur la home 🎉</h2>

      {user ? (
        <p>
          Connecté en tant que <strong>{user.username}</strong>
        </p>
      ) : (
        <p>Chargement du profil...</p>
      )}

      <button
        onClick={logout}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          border: 'none',
          background: 'black',
          color: 'white',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
