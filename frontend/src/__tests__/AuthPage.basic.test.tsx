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

    // Titre global
    expect(screen.getByText(/LE FORUM/i)).toBeInTheDocument();

    // Les deux boutons du switch
    expect(screen.getByRole("button", { name: /connexion/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /créer un compte/i })
    ).toBeInTheDocument();
  });
 
  test("par défaut on est sur Connexion: les champs login sont visibles et pas ceux d'inscription", () => {
    render(<AuthPage />);

    // champs du login visibles
    expect(screen.getByLabelText(/email ou pseudo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();

    // champs spécifiques à l'inscription NE sont PAS là
    // (ex: 'Email' du signup et 'Pseudo' du signup)
    expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^pseudo$/i)).not.toBeInTheDocument();
  });


});
