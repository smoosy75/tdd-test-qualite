import express, { Application } from "express";
import authRoutes from "./routes/auth.routes";
import cors from "cors";



const app: Application = express();


app.use(cors({
  origin: "http://localhost:5173",    // ton front Vite
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,                   // utile si tu utilises des cookies
}));

app.use(express.json());                 // 👈 indispensable
app.use(express.urlencoded({ extended: true })); // (optionnel)

// route de test santé (optionnelle)
app.get("/hello", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ⬇️ ICI : on monte les routes d'auth
app.use("/auth", authRoutes);

app.get("/auth/debug-routes", (req, res) => {
  res.json({ alive: true });
});

// 🔥 test POST direct sans passer par auth.routes.ts
app.post("/auth/signup-direct", (req, res) => {
  console.log("🔥 /auth/signup-direct hit with body:", req.body);
  res.status(201).json({
    user: {
      id: "temp-123",
      email: req.body.email,
      username: req.body.username
    }
  });
});

// 404 à la fin seulement
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

export default app;
