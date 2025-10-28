import { render, screen, within } from "@testing-library/react";
import { vi } from "vitest";

// isolate component Post
vi.mock("@/components/Post", () => ({
  __esModule: true,
  default: ({ id }: { id: string }) => (
    <div data-testid="post-item">POST #{id}</div>
  ),
}));

// Mock global.fetch
const mockUser = {
  id: "user_123",
  username: "Mustapha",
  email: "mustapha@example.com",
  avatar: "http://localhost:8090/api/files/users/user_123/avatar.png",
};

const mockPosts = [
  { id: "p1", title: "Post 1" },
  { id: "p2", title: "Post 2" },
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
      expect(String(url)).toContain("/api/posts?authorId=user_123");
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

import ProfilePage from "./profilPage";

test("affiche avatar, nom et email de l’utilisateur", async () => {
  render(<ProfilePage />);

  // Nom et email
  expect(await screen.findByText("Mustapha")).toBeInTheDocument();
  expect(await screen.findByText("mustapha@example.com")).toBeInTheDocument();

  // Avatar <img src=...>
  const avatar = await screen.findByRole("img", { name: /avatar/i });
  expect(avatar).toHaveAttribute("src", mockUser.avatar);
});

test('affiche la liste "Mes posts" avec les posts de l’utilisateur', async () => {
  render(<ProfilePage />);

  const section = await screen.findByRole("region", { name: /mes posts/i });
  const items = await within(section).findAllByTestId("post-item");
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveTextContent("POST #p1");
  expect(items[1]).toHaveTextContent("POST #p2");
});
