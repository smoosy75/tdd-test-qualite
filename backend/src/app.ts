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
