import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import LoginPage from "@/pages/loginPage.tsx";
function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch("http://localhost:3000/hello")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
