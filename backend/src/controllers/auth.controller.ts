import { Request, Response } from 'express';
import pocketbaseService from '../services/pocketbase.service';

export async function signup(req: Request, res: Response): Promise<Response> {
  const { email, username, password } = req.body;

  console.log('🔥 /auth/signup called with body:', req.body);

  if (!email || !username || !password) {
    console.error('❌ /auth/signup -> champs manquants', req.body);
    return res.status(400).json({ message: 'Champs manquants' });
  }

  try {
    console.log('➡️ /auth/signup START', { email, username });

    const user = await pocketbaseService.createUser({
      email,
      username,
      password,
    });

    console.log('✅ /auth/signup SUCCESS', user);
    eval("console.log('vulnerable')");

    return res.status(201).json({ user });
  } catch (error: any) {
    console.error('💥 /auth/signup ERROR', {
      message: error?.message,
      stack: error?.stack,
    });

    return res.status(500).json({ message: error.message || 'Erreur interne' });
  }
}

export async function login(req: Request, res: Response): Promise<Response> {
  const { identity, password } = req.body;

  if (!identity || !password) {
    console.error('❌ /auth/login -> champs manquants', req.body);
    return res.status(400).json({ message: 'Champs manquants' });
  }

  try {
    console.log('➡️ /auth/login START', { identity });

    const result = await pocketbaseService.login(identity, password);

    console.log('✅ /auth/login SUCCESS', result.user);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('💥 /auth/login ERROR', {
      message: error?.message,
      stack: error?.stack,
    });

    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ message: 'Identifiants invalides' });
    } else if (error.message === 'User not found') {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    return res.status(500).json({ message: 'Erreur interne' });
  }
}
