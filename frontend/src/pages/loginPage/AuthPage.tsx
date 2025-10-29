import React, { useState, FormEvent, CSSProperties } from "react";

const API_URL = "http://localhost:5000"; // <-- ton backend Node

// --- Types ---
interface SignupData {
  email: string;
  password: string;
  username: string;
}

interface LoginData {
  identity: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: any;
}

// --- API APPELLE TON BACK ---
async function apiSignup(data: SignupData) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      username: data.username,
    }),
  });

  if (!res.ok) throw await res.json().catch(() => ({}));
  return res.json(); // { user: {...} } par ex.
}

async function apiLogin(data: LoginData) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity: data.identity,
      password: data.password,
    }),
  });

  if (!res.ok) throw await res.json().catch(() => ({}));
  return res.json() as Promise<LoginResponse>; // { token, user }
}

// --- Component ---
const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");

  // login state
  const [identity, setIdentity] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // --- Handlers ---
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const data = await apiLogin({
        identity,
        password: loginPassword,
      });

      // On stocke ce que renvoie ton backend
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      setInfoMsg("Connecté avec succès !");
      // Exemple : window.location.href = "/forum";
    } catch {
      setErrorMsg("Email ou mot de passe invalide.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      await apiSignup({
        email: signupEmail,
        username: signupUsername,
        password: signupPassword,
      });

      // après création du compte => repasser en login
      setMode("login");
      setIdentity(signupEmail);
      setLoginPassword("");
      setInfoMsg("Compte créé. Vous pouvez vous connecter.");
    } catch {
      setErrorMsg("Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

   // --- Styles ---
  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "system-ui, sans-serif",
    color: "#000",
    gap: "1.5rem",
  };

  const titleStyle: CSSProperties = {
    fontSize: "2rem",
    fontWeight: 700,
    letterSpacing: "2px",
  };

  const cardStyle: CSSProperties = {
    width: "100%",
    maxWidth: "360px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    backgroundColor: "#fff",
  };

  const toggleContainer: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
    marginBottom: "16px",
  };

  const toggleBtn: CSSProperties = {
    borderRadius: "6px",
    border: "1px solid #000",
    fontSize: ".85rem",
    fontWeight: 600,
    padding: "8px",
    cursor: "pointer",
    transition: "0.2s",
  };

  const activeBtn: CSSProperties = {
    ...toggleBtn,
    backgroundColor: "#000",
    color: "#fff",
  };

  const inactiveBtn: CSSProperties = {
    ...toggleBtn,
    backgroundColor: "#fff",
    color: "#000",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: ".75rem",
    fontWeight: 500,
    marginBottom: "4px",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: ".85rem",
    padding: "8px 0px",
    marginBottom: "10px",
    paddingLeft: "8px",
  };

  const buttonStyle: CSSProperties = {
    width: "100%",
    borderRadius: "6px",
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: 600,
    fontSize: ".85rem",
    padding: "9px 10px",
    border: "1px solid #000",
    cursor: "pointer",
    marginTop: "4px",
  };

  const msgErrorStyle: CSSProperties = {
    color: "red",
    fontSize: ".8rem",
    marginBottom: "8px",
  };

  const msgInfoStyle: CSSProperties = {
    color: "green",
    fontSize: ".8rem",
    marginBottom: "8px",
  };

  // --- Render ---
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>LE FORUM</h1>

      <div style={cardStyle}>
        {/* Onglets Connexion / Inscription */}
        <div style={toggleContainer}>
          <button
            style={mode === "login" ? activeBtn : inactiveBtn}
            disabled={loading}
            onClick={() => {
              setMode("login");
              setErrorMsg("");
              setInfoMsg("");
            }}
          >
            Connexion
          </button>
          <button
            style={mode === "signup" ? activeBtn : inactiveBtn}
            disabled={loading}
            onClick={() => {
              setMode("signup");
              setErrorMsg("");
              setInfoMsg("");
            }}
          >
            Créer un compte
          </button>
        </div>

        {errorMsg && <div style={msgErrorStyle}>{errorMsg}</div>}
        {infoMsg && <div style={msgInfoStyle}>{infoMsg}</div>}

        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <label htmlFor="identity" style={labelStyle}>
              Email ou pseudo
            </label>
            <input
              id="identity"
              style={inputStyle}
              type="text"
              required
              placeholder="user@test.com"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              disabled={loading}
            />

            <label htmlFor="login-password" style={labelStyle}>
              Mot de passe
            </label>
            <input
              id="login-password"
              style={inputStyle}
              type="password"
              required
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              disabled={loading}
            />

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <label htmlFor="signup-email" style={labelStyle}>
              Email
            </label>
            <input
              id="signup-email"
              style={inputStyle}
              type="email"
              required
              placeholder="user@test.com"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              disabled={loading}
            />

            <label htmlFor="signup-username" style={labelStyle}>
              Pseudo
            </label>
            <input
              id="signup-username"
              style={inputStyle}
              type="text"
              required
              placeholder="monPseudo"
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              disabled={loading}
            />

            <label htmlFor="signup-password" style={labelStyle}>
              Mot de passe
            </label>
            <input
              id="signup-password"
              style={inputStyle}
              type="password"
              required
              placeholder="minimum 8 caractères"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              disabled={loading}
            />

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
