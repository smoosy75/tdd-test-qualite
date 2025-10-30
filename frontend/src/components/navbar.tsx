import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status (placeholder - integrate with your auth system)
  useEffect(() => {
    // TODO: Replace with actual auth check from PocketBase or your auth service
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      setIsAuthenticated(!!token);
    };

    checkAuth();

    // Listen for auth changes
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav style={{
      backgroundColor: "#2c3e50",
      padding: "1rem 2rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* Logo/Brand */}
        <Link
          to="/"
          style={{
            color: "#ecf0f1",
            fontSize: "1.5rem",
            fontWeight: "bold",
            textDecoration: "none",
            transition: "color 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#3498db"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#ecf0f1"}
        >
          Forum TDD
        </Link>

        {/* Navigation Links */}
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link
            to="/posts"
            style={{
              color: "#ecf0f1",
              textDecoration: "none",
              fontSize: "1rem",
              transition: "color 0.3s",
              padding: "0.5rem 1rem",
              borderRadius: "4px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#3498db";
              e.currentTarget.style.backgroundColor = "rgba(52, 152, 219, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#ecf0f1";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Posts
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                style={{
                  color: "#ecf0f1",
                  textDecoration: "none",
                  fontSize: "1rem",
                  transition: "color 0.3s",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#3498db";
                  e.currentTarget.style.backgroundColor = "rgba(52, 152, 219, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#ecf0f1";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c0392b"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e74c3c"}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: "#ecf0f1",
                  textDecoration: "none",
                  fontSize: "1rem",
                  transition: "all 0.3s",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  border: "1px solid #3498db"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#3498db";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#ecf0f1";
                }}
              >
                Sign In
              </Link>

              <Link
                to="/register"
                style={{
                  backgroundColor: "#27ae60",
                  color: "white",
                  textDecoration: "none",
                  fontSize: "1rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  transition: "background-color 0.3s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#229954"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#27ae60"}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
