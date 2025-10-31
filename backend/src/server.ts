import app from './app';
import postRouter from './routes/posts.routes';
import commentsRouter from './routes/comments.routes';
import authGuard from './middleware/auth.middleware';
import authRoutes from './routes/auth.routes';

// Define all routes here
app.get('/', (_, res) => res.status(200).json({ status: 'API is running' }));
app.get('/test', (req, res) => res.status(200).json({ status: 'OK' }));
app.get('/hello', (_, res) => res.status(200).json({ status: 'ok' }));

app.get('/auth/debug-routes', (req, res) => {
  res.json({ alive: true });
});

app.get('/me', authGuard, (req, res) => {
  res.json({ user: (req as any).user });
});

app.use('/api/posts', postRouter);
app.use('/api/comments', commentsRouter);
app.use('/auth', authRoutes);

// 404 à la fin seulement
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});




