import { Routes, Route } from "react-router-dom";

import LoginPage from "@/pages/loginPage.tsx";
import ProfilePage from "./pages/profilPage.tsx/profilPage";

function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
