import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { vi } from 'vitest';
import ProfilePage from './profilPage';

const mockUser = {
  id: 'user_123',
  username: 'Mustapha',
  email: 'mustapha@example.com',
  avatar: 'http://localhost:8090/api/files/users/user_123/avatar.png',
};

const mockPosts = [
  { id: 'p1', title: 'Post 1', body: 'Contenu 1' },
  { id: 'p2', title: 'Post 2', body: 'Contenu 2' },
];

beforeEach(() => {
  (globalThis as unknown as { fetch: typeof fetch }).fetch = vi.fn(
    (url: RequestInfo, opts?: RequestInit) => {
      // GET /api/profile
      if (typeof url === 'string' && url.endsWith('/api/profile') && !opts) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser),
        } as Response);
      }

      // GET /api/posts
      if (typeof url === 'string' && url.includes('/api/posts?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPosts),
        } as Response);
      }

      // PUT /api/profile
      if (
        typeof url === 'string' &&
        url.endsWith('/api/profile') &&
        opts?.method === 'PUT'
      ) {
        const body = JSON.parse(String(opts.body));
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...mockUser, username: body.username }),
        } as Response);
      }

      throw new Error('unexpected fetch: ' + url);
    },
  ) as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- Test 1 : affichage du profil ---
test('affiche avatar, nom et email de l’utilisateur', async () => {
  render(<ProfilePage />);
  expect(await screen.findByText('Mustapha')).toBeInTheDocument();
  expect(await screen.findByText('mustapha@example.com')).toBeInTheDocument();
  const avatar = await screen.findByRole('img', { name: /avatar/i });
  expect(avatar).toHaveAttribute('src', mockUser.avatar);
});

// --- Test 2 : affichage des posts ---
test("affiche la liste 'Mes posts' avec les posts de l’utilisateur", async () => {
  render(<ProfilePage />);
  const section = await screen.findByRole('region', { name: /mes posts/i });
  const posts = await within(section).findAllByRole('article');
  expect(posts).toHaveLength(2);
  expect(posts[0]).toHaveTextContent('Post 1');
  expect(posts[1]).toHaveTextContent('Post 2');
});

// --- Test 3 : fallback en cas d'erreur ---
test('affiche les données de démonstration quand le fetch échoue', async () => {
  (globalThis as unknown as { fetch: typeof fetch }).fetch = vi.fn(() =>
    Promise.reject(new Error('Erreur réseau')),
  ) as unknown as typeof fetch;
  render(<ProfilePage />);

  const banner = await screen.findByRole('alert');
  expect(banner).toHaveTextContent(/démonstration/i);
  expect(await screen.findByText('user123')).toBeInTheDocument();
  expect(await screen.findByText('demo@example.com')).toBeInTheDocument();
});

// --- Test 4 : édition du nom d’utilisateur ---
test('permet d’éditer le nom d’utilisateur et de voir la mise à jour affichée', async () => {
  render(<ProfilePage />);

  await screen.findByText('Mustapha');
  fireEvent.click(screen.getByRole('button', { name: /modifier/i }));

  const input = screen.getByDisplayValue('Mustapha');
  fireEvent.change(input, { target: { value: 'Nouvel utilisateur' } });
  fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }));

  await waitFor(() =>
    expect(screen.getByText('Nouvel utilisateur')).toBeInTheDocument(),
  );
});

test('comportement utilisateur : modifier puis annuler l’édition du profil', async () => {
  render(<ProfilePage />);

  expect(await screen.findByText('Mustapha')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /modifier le profil/i }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /modifier le profil/i }));
  expect(
    screen.getByRole('button', { name: /sauvegarder/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /annuler/i }));

  expect(screen.getByText('Mustapha')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /modifier le profil/i }),
  ).toBeInTheDocument();
});
