import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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
});
