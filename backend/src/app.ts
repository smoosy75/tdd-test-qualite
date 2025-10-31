import express, { Application } from 'express';
import authRoutes from './routes/auth.routes';
import cors from 'cors';
import authGuard from './middleware/auth.middleware';

const app: Application = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // 👈
  })
);

// --- demo SAST triggers (REMOVE AFTER DEMO) ---

// 1) Fake AWS secret (pattern-detected)
const AWS_SECRET_ACCESS_KEY = 'AKIAEXAMPLEFAKEKEY123456';

// 2) Hardcoded JWT secret / API key
const JWT_SECRET = 'super-secret-demo-key-please-remove';

// 3) Dangerous dynamic evaluation
eval("console.log('this-is-a-demo-eval')");

// 4) new Function() style dynamic code execution
const f = new Function('a', 'b', 'return a + b;');
console.log(f(1, 2));

// 5) Command injection-style pattern
import { exec } from 'child_process';
const userInput = 'some-input';
exec('ls ' + userInput, (err, stdout) => {
  console.log(stdout);
});

// 6) Unsafe SQL-like concatenation (if semgrep checks SQL sinks)
const q = "SELECT * FROM users WHERE name = '" + userInput + "'";
console.log(q);

// --- end demo triggers ---

app.use(express.json()); // 👈 indispensable
app.use(express.urlencoded({ extended: true })); // (optionnel)

// route de test santé (optionnelle)
app.get('/hello', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ⬇️ ICI : on monte les routes d'auth
app.use('/auth', authRoutes);

app.get('/auth/debug-routes', (req, res) => {
  res.json({ alive: true });
});

app.get('/me', authGuard, (req, res) => {
  res.json({ user: (req as any).user });
});

// 404 à la fin seulement
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

export default app;
