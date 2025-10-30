const POCKETBASE_URL = process.env.PB_URL || 'http://localhost:8090';

interface UserSignup {
  email: string;
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  record: any;
}

class PocketbaseService {
  /**
   * Crée un utilisateur via l'API PocketBase
   */
  async createUser({ email, username, password }: UserSignup) {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/users/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username,
        password,
        passwordConfirm: password, // obligatoire for PocketBase
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur PocketBase (signup)');
    }

    const data = await res.json();
    return {
      id: data.id,
      email: data.email,
      username: data.username,
    };
  }

  /**
   * Connecte un utilisateur via PocketBase
   */
  async login(
    identity: string,
    password: string
  ): Promise<{ token: string; user: any }> {
    const res = await fetch(
      `${POCKETBASE_URL}/api/collections/users/auth-with-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password }),
      }
    );

    if (!res.ok) {
      if (res.status === 400) throw new Error('Invalid credentials');
      if (res.status === 404) throw new Error('User not found');
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erreur PocketBase (login)');
    }

    const data: LoginResponse = await res.json();

    return {
      token: data.token,
      user: data.record,
    };
  }

  /**
   * ✅ Valide un token utilisateur via PocketBase REST
   */
  async validateToken(token: string) {
    try {
      const res = await fetch(
        `${POCKETBASE_URL}/api/collections/users/auth-refresh`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) return null;

      const data = await res.json();
      return data.record ?? null; // retourne l'utilisateur ou null
    } catch (err) {
      return null;
    }
  }
}

export default new PocketbaseService();
