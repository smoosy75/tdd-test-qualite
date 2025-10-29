// src/pages/ProfilePage/ProfilePage.test.tsx
import { render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import ProfilePage from "./profilPage";

const mockUser = {
  id: "user_123",
  username: "Mustapha",
  email: "mustapha@example.com",
  avatar: "http://localhost:8090/api/files/users/user_123/avatar.png",
};

const mockPosts = [
  { id: "p1", title: "Post 1", body: "Contenu 1" },
  { id: "p2", title: "Post 2", body: "Contenu 2" },
];

beforeEach(() => {
  let call = 0;

  globalThis.fetch = vi.fn((url: RequestInfo) => {
    call++;
    if (call === 1) {
      expect(url).toContain("/api/profile");
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);
    }
    if (call === 2) {
      expect(String(url)).toContain(`/api/posts?authorId=${mockUser.id}`);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      } as Response);
    }
    throw new Error("unexpected fetch call: " + url);
  }) as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("affiche avatar, nom et email de l’utilisateur", async () => {
  render(<ProfilePage />);

  expect(await screen.findByText("Mustapha")).toBeInTheDocument();
  expect(await screen.findByText("mustapha@example.com")).toBeInTheDocument();

  const avatar = await screen.findByRole("img", { name: /avatar/i });
  expect(avatar).toHaveAttribute("src", mockUser.avatar);
});

test("affiche la liste 'Mes posts' avec les posts de l’utilisateur", async () => {
  render(<ProfilePage />);

  const section = await screen.findByRole("region", { name: /mes posts/i });

  const posts = await within(section).findAllByRole("article");
  expect(posts).toHaveLength(2);

  expect(posts[0]).toHaveTextContent("Post 1");
  expect(posts[0]).toHaveTextContent("Contenu 1");
  expect(posts[1]).toHaveTextContent("Post 2");
  expect(posts[1]).toHaveTextContent("Contenu 2");
});
