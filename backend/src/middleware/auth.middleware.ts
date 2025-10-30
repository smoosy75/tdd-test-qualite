import { Request, Response, NextFunction } from 'express';
import pocketbase from '../services/pocketbase.service';

export default async function authGuard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // vérifie le token via PocketBase
    const user = await pocketbase.validateToken(token);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // stocke l'utilisateur dans req pour usage futur
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
