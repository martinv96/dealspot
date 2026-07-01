import test from "node:test";
import assert from "node:assert/strict";
import db from "../../src/models/index.js";
import { adminSetUserBlock, adminStats } from "../../src/controllers/admin.controller.js";

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

test("adminStats retourne un résumé agrégé cohérent", async () => {
  const originalUserCount = db.User.count;
  const originalUserFindAll = db.User.findAll;
  const originalUserSecurityCount = db.UserSecurity.count;
  const originalAnnonceCount = db.Annonce.count;
  const originalAnnonceFindAll = db.Annonce.findAll;

  db.User.count = async () => 12;
  db.UserSecurity.count = async () => 2;
  db.User.findAll = async () => [
    { role: "acheteur", count: "5" },
    { role: "vendeur", count: "6" },
    { role: "admin", count: "1" }
  ];
  db.Annonce.count = async () => 20;
  db.Annonce.findAll = async ({ attributes }) => {
    const key = attributes?.[0];
    if (key === "statut") {
      return [
        { statut: "active", count: "13" },
        { statut: "brouillon", count: "4" },
        { statut: "expirée", count: "3" }
      ];
    }

    return [
      { categorie: "electronique", count: "8" },
      { categorie: "meubles", count: "7" }
    ];
  };

  const req = {};
  const res = createRes();

  try {
    await adminStats(req, res);
  } finally {
    db.User.count = originalUserCount;
    db.User.findAll = originalUserFindAll;
    db.UserSecurity.count = originalUserSecurityCount;
    db.Annonce.count = originalAnnonceCount;
    db.Annonce.findAll = originalAnnonceFindAll;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.users.total, 12);
  assert.equal(res.body.users.blocked, 2);
  assert.equal(res.body.users.byRole.admin, 1);
  assert.equal(res.body.annonces.total, 20);
  assert.equal(res.body.annonces.byStatus.active, 13);
  assert.equal(res.body.annonces.byCategory.electronique, 8);
});

test("adminSetUserBlock bloque un utilisateur existant", async () => {
  const originalUserFindByPk = db.User.findByPk;
  const originalUserSecurityFindOrCreate = db.UserSecurity.findOrCreate;

  const security = {
    is_blocked: false,
    blocked_at: null,
    blocked_reason: null,
    async save() {
      return this;
    }
  };

  db.User.findByPk = async () => ({ id: 15, role: "acheteur" });
  db.UserSecurity.findOrCreate = async () => [security, true];

  const req = {
    params: { id: "15" },
    user: { id: 1, role: "admin" },
    body: { blocked: true, reason: "Spam" }
  };
  const res = createRes();

  try {
    await adminSetUserBlock(req, res);
  } finally {
    db.User.findByPk = originalUserFindByPk;
    db.UserSecurity.findOrCreate = originalUserSecurityFindOrCreate;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, "Utilisateur bloqué.");
  assert.equal(res.body.user.id, 15);
  assert.equal(res.body.user.is_blocked, true);
  assert.equal(res.body.user.blocked_reason, "Spam");
});
