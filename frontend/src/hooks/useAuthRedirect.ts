import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

    if (!token && !isAuthPage) {
      navigate("/login");
    } else if (token && isAuthPage) {
      navigate("/home");
    }
  }, [location.pathname, token]);
}
