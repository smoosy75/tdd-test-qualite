import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/loginPage.tsx/LoginPage';
import ProfilePage from './pages/profilPage.tsx/profilPage';

function App() {
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
