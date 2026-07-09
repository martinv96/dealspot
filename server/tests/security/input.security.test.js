import test from "node:test";
import assert from "node:assert/strict";
import db from "../../src/models/index.js";
import { adminMiddleware } from "../../src/middleware/auth.js";
import {
  validateLoginBody,
  validateRegisterBody,
  validateAnnonceBody
} from "../../src/middleware/validation.js";

// test n°1 : blocage d'injection SQL au login

test("Protection SQL-like: email malveillant refuse au login", () => {
  
  // 1. préparation de la requète et execution
  // On passe une chaîne contenant une tentative d'injection SQL à la place d'un vrai email
  const result = validateLoginBody({
    email: "' OR '1'='1",
    password: "AnyPass1!"
  });

  // 2. assertions (derières vérifs)
  // On s'assure que le validateur renvoie bien une erreur
  assert.ok(result.error);
  // On vérifie que le message d'erreur indique explicitement que l'email est invalide
  assert.match(result.error, /email invalide/i);
});

// test n°2 : blocage d'injection SQL à l'inscription

test("Protection SQL-like: email malveillant refuse a l'inscription", () => {
  
  // 1. préparation de la requète et execution
  // On tente d'injecter du code SQL à la suite d'une adresse email valide lors de l'inscription
  const result = validateRegisterBody({
    pseudo: "user-test",
    email: "admin@example.com' OR '1'='1",
    password: "Password1!"
  });

  // 2. assertions (derières vérifs)
  // Le validateur doit intercepter le format d'email corrompu et générer une erreur
  assert.ok(result.error);
  // On s'assure que la cause du refus est bien liée au format de l'adresse email
  assert.match(result.error, /email invalide/i);
});

// test n°3 : vérification de la whitelist des catégories

test("Protection input: categorie non whitelist refusee", () => {
  
  // 1. préparation de la requète et execution
  // On simule la création d'une annonce avec une tentative d'injection SQL dans le champ catégorie
  const result = validateAnnonceBody({
    titre: "Produit test pour securite",
    description: "Description de test suffisante pour verifier la validation serveur.",
    prix: 50,
    categorie: "electronique' OR '1'='1",
    localisation: "Lyon"
  });

  // 2. assertions (derières vérifs)
  // La catégorie n'étant pas dans la liste autorisée, le validateur doit bloquer
  assert.ok(result.error);
  // On vérifie que l'utilisateur reçoit le bon message lui indiquant que la catégorie n'est pas bonne
  assert.match(result.error, /catégorie sélectionnée est invalide/i);
});

// test n°4 : vérification du type numérique du prix

test("Protection input: prix non numerique refuse", () => {
  
  // 1. préparation de la requète et execution
  // On simule une injection SQL de type destruction de table dans le champ prix
  const result = validateAnnonceBody({
    titre: "Produit test",
    description: "Description assez longue pour passer la validation de longueur minimum.",
    prix: "DROP TABLE users;",
    categorie: "electronique",
    localisation: "Lille"
  });

  // 2. assertions (derières vérifs)
  // Le champ prix doit obligatoirement être un nombre, le texte malveillant doit être rejeté
  assert.ok(result.error);
  // On valide que le message d'erreur exige bien une valeur numérique
  assert.match(result.error, /prix doit être un nombre valide/i);
});

// test n°5 : sécurité contre l'escalade de privilèges

test("Protection privilege escalation: adminMiddleware refuse si role DB n'est pas admin", async () => {
  
  // 1. sauvegarde des méthode de la BDD
  // On sauvegarde la vraie méthode Sequelize pour restaurer l'environnement après le test
  const originalFindByPk = db.User.findByPk;

  // 2. fausse données (mock)
  // On simule qu'en base de données, cet utilisateur possède uniquement le rôle "acheteur"
  db.User.findByPk = async () => ({ id: 10, role: "acheteur" });

  // 3. préparation de la requète et execution
  // On fabrique une fausse requête où le jeton client prétend être "admin"
  const req = {
    user: { id: 10, role: "admin" }
  };

  // Simulation du comportement de la réponse express
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

  // Variable témoin pour savoir si le middleware laisse passer la requête
  let called = false;

  try {
    // On lance le middleware. Le 3ème argument est la fonction next()
    await adminMiddleware(req, res, () => {
      called = true;
    });
  } finally {
    // LE BLOC FINALLY S'EXÉCUTE QUOI QU'IL ARRIVE
    // Restauration de la méthode originale pour ne pas perturber les autres tests
    db.User.findByPk = originalFindByPk;
  }

  // 4. assertions (derières vérifs)
  // On vérifie que la fonction next() n'a pas été appelée
  assert.equal(called, false);
  // Le middleware doit stopper la requête avec un code HTTP 403
  assert.equal(res.statusCode, 403);
  // On s'assure que le message renvoyé à l'utilisateur est explicite sur le manque de droits
  assert.equal(res.body?.message, "Accès administrateur requis.");
});