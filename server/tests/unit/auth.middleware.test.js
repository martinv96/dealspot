import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import db from "../../src/models/index.js";
import { authMiddleware, adminMiddleware, vendeurMiddleware } from "../../src/middleware/auth.js";

// simulation du comportement de la réponse express

/**
 * on crée un faux objet 'res' (express) pour capturer les résultats envoyés par le contrôleur.
 * ça permet d'exécuter les contrôleurs de manière isolée sans lancer un vrai serveur HTTP.
 */
function createRes() {
  return {
    // Par défaut, une réponse HTTP réussie a un code 200
    statusCode: 200,
    // Contiendra les données JSON renvoyées par l'API
    body: null,
    
    // Simule la méthode res.status(code). Permet le chaînage (ex: res.status(200).json(...))
    status(code) {
      this.statusCode = code;
      return this; // On retourne 'this' pour permettre le chaînage
    },
    
    // Simule la méthode res.json(payload) pour stocker le contenu de la réponse
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}


    test("vendeurMiddleware refuse un acheteur même si le token prétend être vendeur", async () => {
      const originalFindByPk = db.User.findByPk;
      db.User.findByPk = async () => ({ id: 42, role: "acheteur" });

      const req = { user: { id: 42, role: "vendeur" } };
      const res = createRes();
      let called = false;

      try {
        await vendeurMiddleware(req, res, () => {
          called = true;
        });
      } finally {
        db.User.findByPk = originalFindByPk;
      }

      assert.equal(called, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.message, "Accès vendeur requis pour créer une annonce.");
    });

    test("vendeurMiddleware autorise un vendeur confirmé en BDD", async () => {
      const originalFindByPk = db.User.findByPk;
      db.User.findByPk = async () => ({ id: 42, role: "vendeur" });

      const req = { user: { id: 42, role: "acheteur" } };
      const res = createRes();
      let called = false;

      try {
        await vendeurMiddleware(req, res, () => {
          called = true;
        });
      } finally {
        db.User.findByPk = originalFindByPk;
      }

      assert.equal(called, true);
      assert.equal(req.user.role, "vendeur");
      assert.equal(res.statusCode, 200);
    });
// test n°1 : refus si pas de token

test("authMiddleware refuse si token manquant", () => {
  
  // 1. préparation de la requète et execution
  // On crée un objet request sans aucun header Authorization
  const req = { headers: {} };
  const res = createRes();
  // Variable témoin pour vérifier si on passe au middleware suivant
  let called = false;

  // On exécute le middleware d'authentification
  authMiddleware(req, res, () => {
    called = true;
  });

  // 2. assertions (derières vérifs)
  // La fonction next() ne doit pas être appelée car le token manque
  assert.equal(called, false);
  // Le middleware doit renvoyer un code de retour 401 (Non autorisé)
  assert.equal(res.statusCode, 401);
  // On valide le contenu du message d'erreur retourné à l'utilisateur
  assert.equal(res.body.message, "Token manquant.");
});

// test n°2 : refus si le token est corrompu ou faux

test("authMiddleware refuse si token invalide", () => {
  
  // 1. préparation de la requète et execution
  // Définition de la clé secrète d'environnement nécessaire pour JWT
  process.env.JWT_SECRET = "unit-test-secret";

  // On envoie un header avec une chaîne de caractères qui ne correspond pas à un vrai JWT
  const req = {
    headers: { authorization: "Bearer invalid.token.value" }
  };
  const res = createRes();
  let called = false;

  // On exécute le middleware
  authMiddleware(req, res, () => {
    called = true;
  });

  // 2. assertions (derières vérifs)
  // L'accès doit être bloqué net
  assert.equal(called, false);
  // Le code HTTP retourné doit être un 401
  assert.equal(res.statusCode, 401);
  // On s'assure que le message d'erreur indique bien que le token est invalide
  assert.equal(res.body.message, "Token invalide.");
});

// test n°3 : succès si le token est valide

test("authMiddleware ajoute req.user quand token valide", () => {
  
  // 1. préparation de la requète et execution
  process.env.JWT_SECRET = "unit-test-secret";

  // On génère un vrai jeton JWT signé avec notre clé de test
  const token = jwt.sign({ id: 42, email: "martin@example.com", role: "acheteur" }, process.env.JWT_SECRET);
  // On injecte ce vrai jeton dans le header de la requête
  const req = {
    headers: { authorization: `Bearer ${token}` }
  };
  const res = createRes();
  let called = false;

  // On exécute le middleware
  authMiddleware(req, res, () => {
    called = true;
  });

  // 2. assertions (derières vérifs)
  // Cette fois-ci, la fonction next() doit être exécutée avec succès
  assert.equal(called, true);
  // Le middleware doit avoir extrait l'ID du token et l'avoir greffé sur l'objet request
  assert.equal(req.user.id, 42);
  // On vérifie que l'email de l'utilisateur est bien présent lui aussi
  assert.equal(req.user.email, "martin@example.com");
});

// test n°4 : refus admin si l'utilisateur n'est même pas loggé

test("adminMiddleware refuse si req.user absent", async () => {
  
  // 1. préparation de la requète et execution
  // On simule une requête vide qui n'est pas passée par authMiddleware (req.user est undefined)
  const req = {};
  const res = createRes();
  let called = false;

  // Appel du middleware d'administration
  await adminMiddleware(req, res, () => {
    called = true;
  });

  // 2. assertions (derières vérifs)
  // L'accès est refusé immédiatement
  assert.equal(called, false);
  // Retour d'une erreur 401 car l'identité n'est pas établie
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Token invalide.");
});

// test n°5 : validation admin si le rôle correspond en base de données

test("adminMiddleware appelle next si role admin en BDD", async () => {
  
  // 1. sauvegarde des méthode de la BDD
  const originalFindByPk = db.User.findByPk;
  
  // 2. fausse données (mock)
  // On simule que la base de données confirme bien que cet utilisateur est un administrateur
  db.User.findByPk = async () => ({ id: 42, role: "admin" });

  // 3. préparation de la requète et execution
  // Le token de la requête prétend être simple acheteur, mais c'est la BDD qui fait foi
  const req = { user: { id: 42, role: "acheteur" } };
  const res = createRes();
  let called = false;

  try {
    await adminMiddleware(req, res, () => {
      called = true;
    });
  } finally {
    // LE BLOC FINALLY S'EXÉCUTE QUOI QU'IL ARRIVE
    // Restauration de la méthode originale pour ne pas perturber les autres tests
    db.User.findByPk = originalFindByPk;
  }

  // 4. assertions (derières vérifs)
  // La validation est réussie, le middleware appelle la suite
  assert.equal(called, true);
  // Le rôle de req.user doit avoir été mis à jour avec la valeur officielle de la BDD ("admin")
  assert.equal(req.user.role, "admin");
  // Le statut de la réponse reste à 200 (OK)
  assert.equal(res.statusCode, 200);
});

// test n°6 : refus admin si le rôle en base de données ne correspond pas

test("adminMiddleware refuse si role non admin en BDD", async () => {
  
  // 1. sauvegarde des méthode de la BDD
  const originalFindByPk = db.User.findByPk;
  
  // 2. fausse données (mock)
  // On simule qu'en BDD cet utilisateur n'est en fait qu'un simple vendeur
  db.User.findByPk = async () => ({ id: 42, role: "vendeur" });

  // 3. préparation de la requète et execution
  // Même si le token prétend frauduleusement être admin, la BDD va le bloquer
  const req = { user: { id: 42, role: "admin" } };
  const res = createRes();
  let called = false;

  try {
    await adminMiddleware(req, res, () => {
      called = true;
    });
  } finally {
    // Restauration de la méthode originale
    db.User.findByPk = originalFindByPk;
  }

  // 4. assertions (derières vérifs)
  // La fonction next() ne doit surtout pas être appelée
  assert.equal(called, false);
  // Le middleware doit renvoyer un code HTTP 403 (Accès interdit)
  assert.equal(res.statusCode, 403);
  // On valide le message de refus renvoyé au client
  assert.equal(res.body.message, "Accès administrateur requis.");
});