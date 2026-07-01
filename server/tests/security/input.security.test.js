import test from "node:test";
import assert from "node:assert/strict";
import db from "../../src/models/index.js";
import { adminMiddleware } from "../../src/middleware/auth.js";
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
  assert.match(result.error, /catégorie sélectionnée est invalide/i);
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
  assert.match(result.error, /prix doit être un nombre valide/i);
});

test("Protection privilege escalation: adminMiddleware refuse si role DB n'est pas admin", async () => {
  const originalFindByPk = db.User.findByPk;

  db.User.findByPk = async () => ({ id: 10, role: "acheteur" });

  const req = {
    user: { id: 10, role: "admin" }
  };
  const res = {
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
  let called = false;

  try {
    await adminMiddleware(req, res, () => {
      called = true;
    });
  } finally {
    db.User.findByPk = originalFindByPk;
  }

  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body?.message, "Accès administrateur requis.");
});
