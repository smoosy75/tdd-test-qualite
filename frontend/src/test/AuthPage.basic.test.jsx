import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthPage from "../AuthPage";

// on mock juste les fonctions pour pas qu'elles appellent le vrai backend
jest.mock("../../hooks/useAuth", () => ({
  login: jest.fn(),
  signup: jest.fn(),
}));

describe("AuthPage (tests simples)", () => {
  test("affiche le formulaire de connexion par défaut", () => {
    render(<AuthPage />);

    // le champ "Email ou pseudo" existe
    expect(screen.getByLabelText(/email ou pseudo/i)).toBeInTheDocument();

    // le champ "Mot de passe" existe
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();

    // le bouton "Se connecter" existe
    expect(
      screen.getByRole("button", { name: /se connecter/i })
    ).toBeInTheDocument();
  });

  test("on peut passer à l'onglet 'Créer un compte'", () => {
    render(<AuthPage />);

    // clique sur l'onglet "Créer un compte"
    const signupTab = screen.getByRole("button", { name: /créer un compte/i });
    fireEvent.click(signupTab);

    // maintenant on doit voir les champs pour créer un compte
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pseudo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument();

    // et le bouton "Créer mon compte"
    expect(
      screen.getByRole("button", { name: /créer mon compte/i })
    ).toBeInTheDocument();
  });

  test("les champs requis existent dans signup", () => {
    render(<AuthPage />);

    // aller sur l'onglet signup
    fireEvent.click(screen.getByRole("button", { name: /créer un compte/i }));

    const emailInput = screen.getByLabelText(/^email$/i);
    const pseudoInput = screen.getByLabelText(/pseudo/i);
    const passInput = screen.getByLabelText(/^mot de passe$/i);

    expect(emailInput).toBeRequired();
    expect(pseudoInput).toBeRequired();
    expect(passInput).toBeRequired();
  });
});