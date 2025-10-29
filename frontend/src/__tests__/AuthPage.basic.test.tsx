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
 
  test("par défaut on est sur Connexion: les champs login sont visibles", () => {
    render(<AuthPage />);

    // Champs du mode login
    expect(screen.getByLabelText(/email ou pseudo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();

    // Champ 'Pseudo' (inscription) NE DOIT PAS être là
    expect(screen.queryByLabelText(/pseudo/i)).not.toBeInTheDocument();
  });


});
