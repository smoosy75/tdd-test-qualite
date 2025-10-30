// @vitest-environment jsdom
import React from 'react';
import {
  render as rtlRender,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import AuthPage from '../pages/loginPage/AuthPage';

// ---------------------------------------------
// Helpers
// ---------------------------------------------
function renderWithRouter(ui: React.ReactElement, { initialEntries = ['/'] } = {}) {
  return rtlRender(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

// ---------------------------------------------
// Mocks
// ---------------------------------------------
// fetch mock
const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

// ✅ spy correct sur localStorage
const localStorageSetItemSpy = vi.spyOn(Storage.prototype, 'setItem');

// (optionnel) neutraliser la navigation réelle si le composant appelle useNavigate après login
vi.mock('react-router-dom', async (orig) => {
  const mod = await orig();
  return { ...mod, useNavigate: () => vi.fn(), MemoryRouter: mod.MemoryRouter, Routes: mod.Routes, Route: mod.Route };
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// ---------------------------------------------
// Tests
// ---------------------------------------------
describe('AuthPage - tests front sans backend', () => {
  test("affiche le titre 'LE FORUM' et les onglets Connexion / Créer un compte", () => {
    renderWithRouter(<AuthPage />);

    expect(screen.getByText(/LE FORUM/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /créer un compte/i })).toBeInTheDocument();
  });

  test("par défaut on est sur Connexion: les champs login sont visibles et pas ceux d'inscription", () => {
    renderWithRouter(<AuthPage />);

    expect(screen.getByLabelText(/email ou pseudo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();

    expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^pseudo$/i)).not.toBeInTheDocument();
  });

  test("cliquer sur 'Créer un compte' affiche le formulaire d'inscription (email, pseudo, mot de passe)", () => {
    renderWithRouter(<AuthPage />);

    fireEvent.click(screen.getByRole('button', { name: /créer un compte/i }));

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pseudo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email ou pseudo/i)).not.toBeInTheDocument();
  });

  test("si le login échoue (fetch renvoie pas ok), on affiche le message d'erreur", async () => {
    renderWithRouter(<AuthPage />);

    fireEvent.change(screen.getByLabelText(/email ou pseudo/i), {
      target: { value: 'wrong@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'badpass' },
    });

    // réponse 401 simulée
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Invalid creds' }), { status: 401 })
    );

    fireEvent.submit(
      screen.getByRole('button', { name: /se connecter/i }).closest('form')!,
    );


    const msg = await screen.findByText(/invalid\s*creds/i);
    expect(msg).toBeInTheDocument();
  });

  test("si le signup échoue, on affiche le message d'erreur d'inscription", async () => {
    renderWithRouter(<AuthPage />);

    fireEvent.click(screen.getByRole('button', { name: /créer un compte/i }));

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'new@user.com' },
    });
    fireEvent.change(screen.getByLabelText(/pseudo/i), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByLabelText(/^mot de passe$/i), {
      target: { value: 'Password123!' },
    });

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'signup error' }), { status: 400 })
    );

    fireEvent.submit(
      screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!,
    );

    const msg = await screen.findByText(/signup\s*error/i);
    expect(msg).toBeInTheDocument();
  });

  test("signup réussi -> repasse en mode login, préremplit l'email et affiche le message de succès", async () => {
    renderWithRouter(<AuthPage />);

    fireEvent.click(screen.getByRole('button', { name: /créer un compte/i }));

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'cool@user.com' },
    });
    fireEvent.change(screen.getByLabelText(/pseudo/i), {
      target: { value: 'cooluser' },
    });
    fireEvent.change(screen.getByLabelText(/^mot de passe$/i), {
      target: { value: 'StrongPass123!' },
    });

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ user: { id: 'u1', username: 'cooluser' } }), { status: 201 })
    );

    fireEvent.submit(
      screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!,
    );

    await waitFor(() => {
      // de retour sur l'onglet Connexion
      expect(screen.getByLabelText(/email ou pseudo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email ou pseudo/i) as HTMLInputElement).toHaveValue('cool@user.com');
      expect(screen.getByText(/compte créé\. vous pouvez vous connecter\./i)).toBeInTheDocument();
    });
  });

  test("le bouton se désactive pendant l'envoi (loading)", async () => {
    renderWithRouter(<AuthPage />);

    fireEvent.change(screen.getByLabelText(/email ou pseudo/i), {
      target: { value: 'user1@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'Password123!' },
    });

    let resolveRequest: () => void = () => {};
    const controlledPromise = new Promise<Response>((resolve) => {
      resolveRequest = () => resolve(
        new Response(
          JSON.stringify({
            token: 'zzz',
            user: { id: 'uX', username: 'slowUser' },
          }),
          { status: 200 }
        )
      );
    });

    mockFetch.mockReturnValueOnce(controlledPromise);

    fireEvent.submit(
      screen.getByRole('button', { name: /se connecter/i }).closest('form')!,
    );

    const disabledBtn = screen.getByRole('button', { name: /connexion\.\.\./i });
    expect(disabledBtn).toBeDisabled();

    // libère la promesse pour simuler la fin de la requête
    resolveRequest();

    await waitFor(() => {
      expect(localStorageSetItemSpy).toHaveBeenCalled();
    });
  });
});
