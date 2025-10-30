import { Routes, Route } from 'react-router-dom';
import { useAuthRedirect } from './hooks/useAuthRedirect';
import LoginPage from '@/pages/loginPage';
import HomePage from '@/pages/HomePage';
import ProfilePage from './pages/profilPage.tsx/profilPage';
function App() {
  useAuthRedirect();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/signup" element={<SignupPage />} /> */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}
export default App;
