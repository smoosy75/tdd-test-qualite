import { Routes, Route } from 'react-router-dom';
import PostsList from '@/components/PostsList';
import PostDetail from '@/components/PostDetail';
import Navbar from '@/components/navbar';
import { useAuthRedirect } from './hooks/useAuthRedirect';
import LoginPage from '@/pages/loginPage';
import ProfilePage from './pages/profilPage.tsx/profilPage';
import HomePage from './pages/HomePage.js';

function App() {
  useAuthRedirect();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PostsList />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/posts" element={<PostsList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}
export default App;
