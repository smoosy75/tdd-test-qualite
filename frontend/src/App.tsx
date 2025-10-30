import { Routes, Route } from 'react-router-dom';
import PostsList from '@/components/PostsList';
import PostDetail from '@/components/PostDetail';
import Navbar from '@/components/navbar';
import LoginPage from './pages/loginPage.tsx';
import ProfilePage from './pages/profilPage.tsx/profilPage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PostsList />} />
        <Route path="/posts" element={<PostsList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

export default App;
