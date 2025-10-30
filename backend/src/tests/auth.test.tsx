import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });
import request from 'supertest';
// ✅ Mock PocketBase service
jest.mock('../services/pocketbase.service', () => ({
  __esModule: true,
  default: {
    createUser: jest.fn(),
    login: jest.fn(),
  },
}));

import app from '../app';
import pocketbaseService from '../services/pocketbase.service';

// ✨ typage pour utiliser les mocks
const svc = pocketbaseService as unknown as {
  createUser: jest.Mock;
  login: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Auth API', () => {
  // ✅ TEST 1 — Signup OK
  it('POST /auth/signup - crée un utilisateur valide', async () => {
    svc.createUser.mockResolvedValueOnce({
      id: 'u_123',
      email: 'test@example.com',
      username: 'testuser',
    });

    const res = await request(app).post('/auth/signup').send({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      id: 'u_123',
      email: 'test@example.com',
      username: 'testuser',
    });
  });

  // ✅ TEST 2 — Signup KO (champs manquants)
  it('POST /auth/signup - 400 si champs manquants', async () => {
    const res = await request(app).post('/auth/signup').send({
      email: 'incomplete@example.com',
      // manque username et password
    });

    expect(res.status).toBe(400);
    expect(svc.createUser).not.toHaveBeenCalled();
  });

  // ✅ TEST 3 — Login OK
  it('POST /auth/login - login réussi', async () => {
    svc.login.mockResolvedValueOnce({
      token: 'jwt-123',
      user: { id: 'u1', email: 'test@example.com', username: 'tester' },
    });

    const res = await request(app).post('/auth/login').send({
      identity: 'test@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      token: 'jwt-123',
      user: { id: 'u1', email: 'test@example.com', username: 'tester' },
    });
  });

  // ✅ TEST 4 — Login KO (mauvais mdp)
  it('POST /auth/login - 401 mauvais credentials', async () => {
    svc.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    const res = await request(app).post('/auth/login').send({
      identity: 'test@example.com',
      password: 'wrong',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
