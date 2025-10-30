import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import authGuard from './middleware/auth.middleware';

const app: Application = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  }),
);

app.use(express.json());

app.get('/hello', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);

app.get('/auth/debug-routes', (_req: Request, res: Response) => {
  res.json({ alive: true, msg: 'auth routes zone reached' });
});

app.get('/me', authGuard, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
});

export default app;
