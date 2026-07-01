import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import db from "../../src/models/index.js";
import { authMiddleware, adminMiddleware } from "../../src/middleware/auth.js";

function createRes() {
  return {
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
}

test("authMiddleware refuse si token manquant", () => {
  const req = { headers: {} };
  const res = createRes();
  let called = false;

  authMiddleware(req, res, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Token manquant.");
});

test("authMiddleware refuse si token invalide", () => {
  process.env.JWT_SECRET = "unit-test-secret";

  const req = {
    headers: { authorization: "Bearer invalid.token.value" }
  };
  const res = createRes();
  let called = false;

  authMiddleware(req, res, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Token invalide.");
});

test("authMiddleware ajoute req.user quand token valide", () => {
  process.env.JWT_SECRET = "unit-test-secret";

  const token = jwt.sign({ id: 42, email: "martin@example.com", role: "acheteur" }, process.env.JWT_SECRET);
  const req = {
    headers: { authorization: `Bearer ${token}` }
  };
  const res = createRes();
  let called = false;

  authMiddleware(req, res, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(req.user.id, 42);
  assert.equal(req.user.email, "martin@example.com");
});

test("adminMiddleware refuse si req.user absent", async () => {
  const req = {};
  const res = createRes();
  let called = false;

  await adminMiddleware(req, res, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Token invalide.");
});

test("adminMiddleware appelle next si role admin en BDD", async () => {
  const originalFindByPk = db.User.findByPk;
  db.User.findByPk = async () => ({ id: 42, role: "admin" });

  const req = { user: { id: 42, role: "acheteur" } };
  const res = createRes();
  let called = false;

  try {
    await adminMiddleware(req, res, () => {
      called = true;
    });
  } finally {
    db.User.findByPk = originalFindByPk;
  }

  assert.equal(called, true);
  assert.equal(req.user.role, "admin");
  assert.equal(res.statusCode, 200);
});

test("adminMiddleware refuse si role non admin en BDD", async () => {
  const originalFindByPk = db.User.findByPk;
  db.User.findByPk = async () => ({ id: 42, role: "vendeur" });

  const req = { user: { id: 42, role: "admin" } };
  const res = createRes();
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
  assert.equal(res.body.message, "Accès administrateur requis.");
});
