import test from "node:test";
import assert from "node:assert/strict";
import db from "../../src/models/index.js";
import { adminSetUserBlock, adminStats } from "../../src/controllers/admin.controller.js";

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

// test n°1 : vérification des statistiques admin

test("adminStats retourne un résumé agrégé cohérent", async () => {
  
  // 1. sauvegarde des méthode de la BDD

  // On stocke les vraies fonctions de Sequelize pour pouvoir les restaurer après le test.
  const originalUserCount = db.User.count;
  const originalUserFindAll = db.User.findAll;
  const originalUserSecurityCount = db.UserSecurity.count;
  const originalAnnonceCount = db.Annonce.count;
  const originalAnnonceFindAll = db.Annonce.findAll;

  // 2. fausse données (mock)
  
  // On simule 12 utilisateurs en base de données
  db.User.count = async () => 12;
  
  // On simule 2 utilisateurs bannis/bloqués
  db.UserSecurity.count = async () => 2;
  
  // On simule le résultat d'un GROUP BY par rôle pour les utilisateurs
  db.User.findAll = async () => [
    { role: "acheteur", count: "5" },
    { role: "vendeur", count: "6" },
    { role: "admin", count: "1" }
  ];
  
  // On simule qu'il y a un total de 20 annonces publiées sur la plateforme
  db.Annonce.count = async () => 20;
  
  // Le contrôleur d'administration fait deux requêtes distinctes sur Annonce.findAll.
  // On utilise les arguments ('attributes') passés à la fonction pour savoir quoi répondre.
  db.Annonce.findAll = async ({ attributes }) => {
    // On extrait le premier attribut demandé dans la requête Sequelize
    const key = attributes?.[0];
    
    // Si le contrôleur demande un groupement par "statut", on lui renvoie les données correspondantes
    if (key === "statut") {
      return [
        { statut: "active", count: "13" },
        { statut: "brouillon", count: "4" },
        { statut: "expirée", count: "3" }
      ];
    }

    // Sinon, par défaut, cela signifie que le contrôleur demande le groupement par "categorie"
    return [
      { categorie: "electronique", count: "8" },
      { categorie: "meubles", count: "7" }
    ];
  };

  // 3. préparation de la requète et execution
  
  // Pas besoin de données spécifiques dans l'objet request pour les stats globales
  const req = {};
  // On génère notre faux objet de réponse grâce à la fonction utilitaire
  const res = createRes();

  try {
    // On appelle la fonction du contrôleur et on attend qu'elle traite nos fausses données
    await adminStats(req, res);
  } finally {
    // LE BLOC FINALLY S'EXÉCUTE QUOI QU'IL ARRIVE (Même si le test plante au-dessus).
    // C'est crucial pour remettre la base de données dans son état d'origine.
    db.User.count = originalUserCount;
    db.User.findAll = originalUserFindAll;
    db.UserSecurity.count = originalUserSecurityCount;
    db.Annonce.count = originalAnnonceCount;
    db.Annonce.findAll = originalAnnonceFindAll;
  }

  // 4. assertions (derières vérifs)
  
  // On vérifie que le contrôleur a bien renvoyé un statut HTTP 200 (OK)
  assert.equal(res.statusCode, 200);
  // On vérifie que le total des utilisateurs calculé par le contrôleur est bien égal à 12
  assert.equal(res.body.users.total, 12);
  // On s'assure que le nombre d'utilisateurs bloqués correspond bien à notre mock (2)
  assert.equal(res.body.users.blocked, 2);
  // On valide la bonne répartition du rôle admin dans l'objet final
  assert.equal(res.body.users.byRole.admin, 1);
  // On valide que le nombre global d'annonces remonté est correct (20)
  assert.equal(res.body.annonces.total, 20);
  // On s'assure que le traitement a bien extrait les 13 annonces actives
  assert.equal(res.body.annonces.byStatus.active, 13);
  // On valide la catégorisation (ici, 8 objets électroniques attendus)
  assert.equal(res.body.annonces.byCategory.electronique, 8);
});

// test n°2 : modération / blocage d'un user

test("adminSetUserBlock bloque un utilisateur existant", async () => {
  
  // 1. sauvegarde des méthode de la BDD
  // On isole à nouveau le comportement en sauvegardant les fonctions d'origine
  const originalUserFindByPk = db.User.findByPk;
  const originalUserSecurityFindOrCreate = db.UserSecurity.findOrCreate;

  // 2. création faux enregistrement
  // On simule une instance de modèle Sequelize avec ses propriétés et sa méthode .save()
  const security = {
    is_blocked: false,      // L'utilisateur n'est pas bloqué au départ
    blocked_at: null,       // Aucune date de blocage initiale
    blocked_reason: null,   // Aucun motif initial
    // Simulation de l'enregistrement en BDD. Retourne simplement l'objet lui-même mis à jour.
    async save() {
      return this;
    }
  };

  // 3. mock requetes user
  
  // On simule que l'utilisateur ciblé existe (ID 15) et possède le rôle "acheteur"
  db.User.findByPk = async () => ({ id: 15, role: "acheteur" });
  
  // Sequelize retourne un tableau [instance, creee_ou_non]. Ici, on retourne notre faux objet 'security'.
  db.UserSecurity.findOrCreate = async () => [security, true];

  // 4. préparation requete simulé
  const req = {
    // L'ID inséré dans l'URL du navigateur (ex: /api/admin/user/15/block)
    params: { id: "15" },
    // Informations de l'administrateur qui effectue l'action de modération (Session)
    user: { id: 1, role: "admin" },
    // Le contenu du formulaire envoyé par l'administrateur (statut souhaité et motif)
    body: { blocked: true, reason: "Spam" }
  };
  
  // Initialisation de notre réceptacle de réponse HTTP
  const res = createRes();

  try {
    // Exécution de l'action de blocage dans le contrôleur d'administration
    await adminSetUserBlock(req, res);
  } finally {
    // Nettoyage impératif des mocks pour laisser la BDD propre pour les futurs tests du projet
    db.User.findByPk = originalUserFindByPk;
    db.UserSecurity.findOrCreate = originalUserSecurityFindOrCreate;
  }

  // 5. assertions comportement blocage
  
  // L'action doit retourner un succès HTTP 200
  assert.equal(res.statusCode, 200);
  // On s'assure que l'API renvoie un message texte explicite de confirmation
  assert.equal(res.body.message, "Utilisateur bloqué.");
  // On vérifie que l'ID renvoyé dans la réponse est bien celui de l'utilisateur ciblé (15)
  assert.equal(res.body.user.id, 15);
  // Crucial : On valide que le drapeau de blocage est bien passé à TRUE
  assert.equal(res.body.user.is_blocked, true);
  // Enfin, on vérifie que le motif du bannissement ("Spam") a bien été enregistré
  assert.equal(res.body.user.blocked_reason, "Spam");
});

test("adminSetUserBlock refuse un identifiant invalide", async () => {
  const res = createRes();

  await adminSetUserBlock({ params: { id: "invalide" }, user: { id: 1 } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "ID utilisateur invalide.");
});

test("adminSetUserBlock refuse le blocage de l'administrateur courant", async () => {
  const res = createRes();

  await adminSetUserBlock({ params: { id: "1" }, user: { id: 1 } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Vous ne pouvez pas vous bloquer vous-même.");
});

test("adminSetUserBlock indique si l'utilisateur est introuvable", async () => {
  const originalUserFindByPk = db.User.findByPk;
  db.User.findByPk = async () => null;
  const res = createRes();

  try {
    await adminSetUserBlock({ params: { id: "15" }, user: { id: 1 }, body: {} }, res);
  } finally {
    db.User.findByPk = originalUserFindByPk;
  }

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Utilisateur introuvable.");
});

test("adminSetUserBlock debloque un utilisateur", async () => {
  const originalUserFindByPk = db.User.findByPk;
  const originalUserSecurityFindOrCreate = db.UserSecurity.findOrCreate;
  const security = {
    is_blocked: true,
    blocked_at: new Date(),
    blocked_reason: "Spam",
    async save() {
      return this;
    }
  };
  db.User.findByPk = async () => ({ id: 15 });
  db.UserSecurity.findOrCreate = async () => [security, false];
  const res = createRes();

  try {
    await adminSetUserBlock({ params: { id: "15" }, user: { id: 1 }, body: { blocked: false } }, res);
  } finally {
    db.User.findByPk = originalUserFindByPk;
    db.UserSecurity.findOrCreate = originalUserSecurityFindOrCreate;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, "Utilisateur débloqué.");
  assert.equal(res.body.user.is_blocked, false);
  assert.equal(res.body.user.blocked_at, null);
  assert.equal(res.body.user.blocked_reason, null);
});