import test from "node:test";
import assert from "node:assert/strict";
import {
  validateLoginBody,
  validateRegisterBody,
  validateAnnonceBody
} from "../../src/middleware/validation.js";

test("Protection SQL-like: email malveillant refuse au login", () => {
  const result = validateLoginBody({
    email: "' OR '1'='1",
    password: "AnyPass1!"
  });

  assert.ok(result.error);
  assert.match(result.error, /email invalide/i);
});

test("Protection SQL-like: email malveillant refuse a l'inscription", () => {
  const result = validateRegisterBody({
    pseudo: "user-test",
    email: "admin@example.com' OR '1'='1",
    password: "Password1!"
  });

  assert.ok(result.error);
  assert.match(result.error, /email invalide/i);
});

test("Protection input: categorie non whitelist refusee", () => {
  const result = validateAnnonceBody({
    titre: "Produit test pour securite",
    description: "Description de test suffisante pour verifier la validation serveur.",
    prix: 50,
    categorie: "electronique' OR '1'='1",
    localisation: "Lyon"
  });

  assert.ok(result.error);
  assert.match(result.error, /categorie selectionnee est invalide/i);
});

test("Protection input: prix non numerique refuse", () => {
  const result = validateAnnonceBody({
    titre: "Produit test",
    description: "Description assez longue pour passer la validation de longueur minimum.",
    prix: "DROP TABLE users;",
    categorie: "electronique",
    localisation: "Lille"
  });

  assert.ok(result.error);
  assert.match(result.error, /prix doit etre un nombre valide/i);
});
