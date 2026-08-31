import test from "node:test";
import assert from "node:assert/strict";
import {
  validateRegisterBody,
  validateLoginBody,
  validateAnnonceBody,
  validateBody,
  validateChangePasswordBody,
  validateForgotPasswordBody,
  validateUpdateProfileBody,
  validateResetPasswordBody
} from "../../src/middleware/validation.js";

// test n°1 : validation inscription réussie

test("validateRegisterBody accepte un payload valide", () => {
  
  // 1. préparation de la requète et execution
  // On passe un objet contenant toutes les informations d'inscription conformes aux attentes
  const result = validateRegisterBody({
    pseudo: "Martin",
    email: "martin@example.com",
    password: "Password1!",
    localisation: "Montreal"
  });

  // 2. assertions (derières vérifs)
  // On s'assure qu'aucune erreur de validation n'a été générée
  assert.ok(!result.error);
  // On vérifie que les données nettoyées et renvoyées correspondent bien aux saisies
  assert.equal(result.value.pseudo, "Martin");
  assert.equal(result.value.email, "martin@example.com");
});

// test n°2 : refus d'une inscription avec mot de passe trop simple

test("validateRegisterBody refuse un mot de passe faible", () => {
  
  // 1. préparation de la requète et execution
  // On fournit un mot de passe "azerty" qui ne remplit pas les critères de sécurité
  const result = validateRegisterBody({
    pseudo: "Martin",
    email: "martin@example.com",
    password: "azerty"
  });

  // 2. assertions (derières vérifs)
  // Le validateur doit rejeter le formulaire et générer une erreur
  assert.ok(result.error);
  // On vérifie que le message d'erreur mentionne bien le problème de mot de passe
  assert.match(result.error, /mot de passe/i);
});

// test n°3 : validation connexion réussie

test("validateLoginBody accepte email et mot de passe", () => {
  
  // 1. préparation de la requète et execution
  // Données classiques de connexion envoyées par l'utilisateur
  const result = validateLoginBody({
    email: "user@mail.fr",
    password: "secret"
  });

  // 2. assertions (derières vérifs)
  // La validation doit passer sans encombre
  assert.ok(!result.error);
  // L'email renvoyé dans le résultat doit correspondre à celui fourni
  assert.equal(result.value.email, "user@mail.fr");
});

// test n°4 : création d'une annonce conforme

test("validateAnnonceBody accepte une annonce valide", () => {
  
  // 1. préparation de la requète et execution
  // Modèle complet d'une petite annonce avec des descriptions et un prix valides
  const result = validateAnnonceBody({
    titre: "Console PS5 en parfait etat",
    description: "Console vendue avec manette, cable HDMI et boite d'origine.",
    prix: 430,
    categorie: "electronique",
    localisation: "Paris"
  });

  // 2. assertions (derières vérifs)
  // Aucune erreur ne doit être levée
  assert.ok(!result.error);
  // Le validateur doit automatiquement injecter ou valider le statut par défaut à "active"
  assert.equal(result.value.statut, "active");
});

// test n°5 : refus du changement de mot de passe si les champs ne correspondent pas

test("validateChangePasswordBody refuse si confirmation differente", () => {
  
  // 1. préparation de la requète et execution
  // Le champ newPassword et confirmPassword contiennent volontairement deux valeurs distinctes
  const result = validateChangePasswordBody({
    currentPassword: "AncienPass1!",
    newPassword: "NouveauPass1!",
    confirmPassword: "Different1!"
  });

  // 2. assertions (derières vérifs)
  // La validation doit échouer à cause de la non-correspondance
  assert.ok(result.error);
  // On s'assure que le message d'erreur pointe bien le problème sur la confirmation
  assert.match(result.error, /confirmation/i);
});

// test n°6 : exigences pour la réinitialisation du mot de passe oublié

test("validateResetPasswordBody exige token et mot de passe conforme", () => {
  
  // 1. préparation de la requète et execution
  // Premier cas de figure : il manque le jeton (token) de sécurité envoyé par email
  const missingToken = validateResetPasswordBody({
    newPassword: "NouveauPass1!",
    confirmPassword: "NouveauPass1!"
  });

  // Deuxième cas de figure : le token est présent mais le mot de passe est trop court ("123")
  const weakPassword = validateResetPasswordBody({
    token: "abc123",
    newPassword: "123",
    confirmPassword: "123"
  });

  // 2. assertions (derières vérifs)
  // On vérifie que l'erreur est bien déclenchée pour l'absence de jeton
  assert.ok(missingToken.error);
  // On vérifie que l'erreur est également déclenchée pour la faiblesse du mot de passe
  assert.ok(weakPassword.error);
});

test("validateUpdateProfileBody normalise les champs facultatifs", () => {
  const result = validateUpdateProfileBody({
    pseudo: "  Martin  ",
    email: " MARTIN@EXAMPLE.COM ",
    telephone: " 514-555-0100 ",
    localisation: " Montreal "
  });

  assert.ok(!result.error);
  assert.equal(result.value.pseudo, "Martin");
  assert.equal(result.value.email, "martin@example.com");
  assert.equal(result.value.telephone, "514-555-0100");
});

test("validateForgotPasswordBody refuse un email invalide", () => {
  const result = validateForgotPasswordBody({ email: "email-invalide" });

  assert.ok(result.error);
  assert.match(result.error, /email/i);
});

test("validateAnnonceBody accepte une mise a jour partielle", () => {
  const result = validateAnnonceBody(
    { prix: "125.50", statut: "brouillon", existingImages: ["image.jpg"] },
    { partial: true }
  );

  assert.ok(!result.error);
  assert.equal(result.value.prix, 125.5);
  assert.equal(result.value.statut, "brouillon");
  assert.deepEqual(result.value.existingImages, ["image.jpg"]);
});

test("validateBody refuse un payload invalide et transmet un payload valide", () => {
  const middleware = validateBody((body) => body.valid ? { value: { valid: true } } : { error: "Invalide." });
  const rejectedResponse = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };

  let nextCalled = false;
  middleware({ body: {} }, rejectedResponse, () => {
    nextCalled = true;
  });
  assert.equal(rejectedResponse.statusCode, 400);
  assert.equal(nextCalled, false);

  const validRequest = { body: { valid: true } };
  middleware(validRequest, rejectedResponse, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
  assert.deepEqual(validRequest.validatedBody, { valid: true });
});