import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage from '@/pages/loginPage';
import ProfilePage from '@/pages/profilPage';

function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    fetch('http://localhost:3000/hello')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('offline'));
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<h1>Bienvenue sur l'application React !</h1>}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

export default App;
