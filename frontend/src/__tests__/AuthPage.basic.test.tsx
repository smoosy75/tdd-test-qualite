import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthPage from "../pages/loginPage/AuthPage";

const mockFetch = jest.fn();
global.fetch = mockFetch as any;

const localStorageSetItemSpy = jest.spyOn(window.localStorage.__proto__, "setItem");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AuthPage - tests front sans backend", () => {
  test("affiche le titre 'LE FORUM' et les onglets Connexion / Créer un compte", () => {
    render(<AuthPage />);

    expect(screen.getByText(/LE FORUM/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /connexion/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /créer un compte/i })
    ).toBeInTheDocument();
  });
 
  test("par défaut on est sur Connexion: les champs login sont visibles et pas ceux d'inscription", () => {
    render(<AuthPage />);

    expect(screen.getByLabelText(/email ou pseudo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();

    
    expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^pseudo$/i)).not.toBeInTheDocument();
  });

  test("cliquer sur 'Créer un compte' affiche le formulaire d'inscription (email, pseudo, mot de passe)", () => {
    render(<AuthPage />);

    fireEvent.click(screen.getByRole("button", { name: /créer un compte/i }));

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pseudo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();

    expect(screen.queryByLabelText(/email ou pseudo/i)).not.toBeInTheDocument();
  });

  test("si le login échoue (fetch renvoie pas ok), on affiche le message d'erreur", async () => {
    render(<AuthPage />);


    fireEvent.change(screen.getByLabelText(/email ou pseudo/i), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: "badpass" },
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid creds" }),
    });

    fireEvent.submit(screen.getByRole("button", { name: /se connecter/i }).closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText(/email ou mot de passe invalide/i)
      ).toBeInTheDocument();
    });
  });

  test("si le signup échoue, on affiche le message d'erreur d'inscription", async () => {
    render(<AuthPage />);

    fireEvent.click(screen.getByRole("button", { name: /créer un compte/i }));

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "new@user.com" },
    });
    fireEvent.change(screen.getByLabelText(/pseudo/i), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByLabelText(/^mot de passe$/i), {
      target: { value: "Password123!" },
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "signup error" }),
    });

    fireEvent.submit(
      screen.getByRole("button", { name: /créer mon compte/i }).closest("form")!
    );

    await waitFor(() => {
      expect(
        screen.getByText(/erreur lors de la création du compte/i)
      ).toBeInTheDocument();
    });
  });

  test("signup réussi -> repasse en mode login, préremplit l'email et affiche le message de succès", async () => {
    render(<AuthPage />);

    fireEvent.click(screen.getByRole("button", { name: /créer un compte/i }));

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "cool@user.com" },
    });
    fireEvent.change(screen.getByLabelText(/pseudo/i), {
      target: { value: "cooluser" },
    });
    fireEvent.change(screen.getByLabelText(/^mot de passe$/i), {
      target: { value: "StrongPass123!" },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: "u1", username: "cooluser" } }),
    });

    fireEvent.submit(
      screen.getByRole("button", { name: /créer mon compte/i }).closest("form")!
    );



    await waitFor(() => {
      expect(screen.getByLabelText(/email ou pseudo/i)).toBeInTheDocument();

      expect(
        screen.getByLabelText(/email ou pseudo/i) as HTMLInputElement
      ).toHaveValue("cool@user.com");

      expect(
        screen.getByText(/compte créé\. vous pouvez vous connecter\./i)
      ).toBeInTheDocument();
    });
  });

});
