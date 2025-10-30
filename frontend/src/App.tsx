import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import LoginPage from "@/pages/loginPage.tsx";
import PostsList from "@/components/PostsList";
import PostDetail from "@/components/PostDetail";
import Navbar from "@/components/navbar";

function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch("http://localhost:3000/hello")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <div>
      <Navbar />

      <header style={{
        textAlign: "center",
        padding: "20px",
        borderBottom: "1px solid #e0e0e0",
        marginBottom: "20px"
      }}>
        <h1>Forum TDD</h1>
        <p>Backend status: {status}</p>
      </header>

      <Routes>
        <Route path="/" element={<PostsList />} />
        <Route path="/posts" element={<PostsList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
