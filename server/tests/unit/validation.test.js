import test from "node:test";
import assert from "node:assert/strict";
import {
  validateRegisterBody,
  validateLoginBody,
  validateAnnonceBody,
  validateChangePasswordBody,
  validateResetPasswordBody
} from "../../src/middleware/validation.js";

test("validateRegisterBody accepte un payload valide", () => {
  const result = validateRegisterBody({
    pseudo: "Martin",
    email: "martin@example.com",
    password: "Password1!",
    localisation: "Montreal"
  });

  assert.ok(!result.error);
  assert.equal(result.value.pseudo, "Martin");
  assert.equal(result.value.email, "martin@example.com");
});

test("validateRegisterBody refuse un mot de passe faible", () => {
  const result = validateRegisterBody({
    pseudo: "Martin",
    email: "martin@example.com",
    password: "azerty"
  });

  assert.ok(result.error);
  assert.match(result.error, /mot de passe/i);
});

test("validateLoginBody accepte email et mot de passe", () => {
  const result = validateLoginBody({
    email: "user@mail.fr",
    password: "secret"
  });

  assert.ok(!result.error);
  assert.equal(result.value.email, "user@mail.fr");
});

test("validateAnnonceBody accepte une annonce valide", () => {
  const result = validateAnnonceBody({
    titre: "Console PS5 en parfait etat",
    description: "Console vendue avec manette, cable HDMI et boite d'origine.",
    prix: 430,
    categorie: "electronique",
    localisation: "Paris"
  });

  assert.ok(!result.error);
  assert.equal(result.value.statut, "active");
});

test("validateChangePasswordBody refuse si confirmation differente", () => {
  const result = validateChangePasswordBody({
    currentPassword: "AncienPass1!",
    newPassword: "NouveauPass1!",
    confirmPassword: "Different1!"
  });

  assert.ok(result.error);
  assert.match(result.error, /confirmation/i);
});

test("validateResetPasswordBody exige token et mot de passe conforme", () => {
  const missingToken = validateResetPasswordBody({
    newPassword: "NouveauPass1!",
    confirmPassword: "NouveauPass1!"
  });

  assert.ok(missingToken.error);

  const weakPassword = validateResetPasswordBody({
    token: "abc123",
    newPassword: "123",
    confirmPassword: "123"
  });

  assert.ok(weakPassword.error);
});
