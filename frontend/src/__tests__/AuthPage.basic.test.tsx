import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthPage from "../pages/loginPage/AuthPage";

describe("AuthPage (basique)", () => {
  test("affiche le titre LE FORUM", () => {
    render(<AuthPage />);
    expect(screen.getByText(/LE FORUM/i)).toBeInTheDocument();
  });

  test("affiche les deux onglets Connexion et Créer un compte", () => {
    render(<AuthPage />);
    expect(screen.getByRole("button", { name: /connexion/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /créer un compte/i })
    ).toBeInTheDocument();
  });

  test("switch vers créer un compte affiche le champ Pseudo", () => {
    render(<AuthPage />);

    // on clique sur "Créer un compte"
    const signupBtn = screen.getByRole("button", { name: /créer un compte/i });
    fireEvent.click(signupBtn);

    // le champ Pseudo doit apparaître
    expect(screen.getByLabelText(/pseudo/i)).toBeInTheDocument();
  });
});
