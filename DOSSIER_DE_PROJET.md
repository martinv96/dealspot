# DOSSIER DE PROJET DEALSPOT — MARTIN VALLÉE

---

## Table des matières

1. [Présentation du projet](#1---présentation-du-projet)
   - 1.1 [Expression de besoin pour le site Dealspot](#11---expression-de-besoin)
2. [Cahier des charges](#2---cahier-des-charges)
   - 2.1 [Présentation de l'application Dealspot](#21---présentation-de-lapplication-dealspot)
   - 2.2 [Benchmark concurrentiel](#22---benchmark-concurrentiel)
   - 2.3 [Technologies utilisées pour le projet](#23---technologies-utilisées-pour-le-projet)
   - 2.4 [Planning du projet](#24---planning-du-projet)
3. [Arborescence de l'application](#3---arborescence-de-lapplication)
   - 3.1 [Page d'accueil – Utilisateur non inscrit](#31---page-daccueil--utilisateur-non-inscrit)
   - 3.2 [Page d'accueil – Utilisateur inscrit](#32---page-daccueil--utilisateur-inscrit)
   - 3.3 [Page annonce – fiche détail](#33---page-annonce--fiche-détail)
4. [Structure et modélisation de l'application](#4---structure-et-modélisation-de-lapplication)
   - 4.1 [Diagramme de cas d'utilisation](#41---diagramme-de-cas-dutilisation)
   - 4.2 [MCD – Modèle Conceptuel de Données](#42---mcd--modèle-conceptuel-de-données)
   - 4.3 [MLD – Modèle Logique de Données](#43---mld--modèle-logique-de-données)
5. [Charte graphique et présentation du Figma](#5---charte-graphique-et-présentation-du-figma)
   - 5.1 [Charte graphique](#51---charte-graphique)
   - 5.2 [Présentation du Figma](#52---présentation-du-figma)
6. [Développement du projet](#6---développement-du-projet)
   - 6.1 [Langages et Frameworks](#61---langages-et-frameworks)
   - 6.2 [Initialisation du projet](#62---initialisation-du-projet)
   - 6.3 [Installation des dépendances](#63---installation-des-dépendances)
   - 6.4 [Structure des répertoires du projet](#64---structure-des-répertoires-du-projet)
   - 6.5 [Base de données](#65---base-de-données)
   - 6.6 [Formulaire d'inscription](#66---formulaire-dinscription)
   - 6.7 [Formulaire de connexion](#67---formulaire-de-connexion)
   - 6.8 [Fonctionnalités du projet](#68---fonctionnalités-du-projet)
   - 6.9 [Sécurité et gestion des utilisateurs](#69---sécurité-et-gestion-des-utilisateurs)
   - 6.10 [Déploiement](#610---déploiement)
- [Conclusion](#conclusion)
- [Annexes](#annexes)

---

## 1 - Présentation du projet

**Dealspot** est une application web de petites annonces entre particuliers. Elle permet à des utilisateurs de publier, consulter, mettre en favori et commenter des annonces de vente ou d'achat de produits d'occasion.

Le projet a été développé dans le cadre de ma formation **Concepteur Développeur d'Applications (CDA)**. L'objectif était de concevoir une application full-stack complète, incluant un backend API REST et un frontend React, avec gestion des utilisateurs, des annonces, des messages privés et d'un système de signalement.

### 1.1 - Expression de besoin

Le besoin exprimé est le suivant : permettre à des particuliers d'acheter et vendre facilement entre eux des articles d'occasion via une interface moderne, responsive et intuitive.

Les exigences principales sont :

- Permettre l'inscription et la connexion sécurisée des utilisateurs
- Permettre la publication d'annonces avec images, prix, catégorie et localisation
- Permettre la recherche et le filtrage des annonces
- Permettre la messagerie privée entre utilisateurs au sujet d'une annonce
- Permettre l'ajout d'annonces en favoris
- Permettre le signalement d'annonces inappropriées
- Offrir une interface responsive et accessible sur mobile et desktop

---

## 2 - Cahier des charges

### 2.1 - Présentation de l'application Dealspot

**Dealspot** est un site de petites annonces en ligne destiné au grand public. Il s'adresse à toute personne souhaitant acheter ou vendre un article d'occasion sans intermédiaire.

L'application se compose de deux parties distinctes :

- **Frontend** : une Single Page Application (SPA) développée avec React, accessible via navigateur
- **Backend** : une API REST développée avec Node.js et Express, connectée à une base de données MySQL

### 2.2 - Benchmark concurrentiel

Plusieurs plateformes de petites annonces existent sur le marché français :

| Plateforme | Points forts | Points faibles |
|------------|-------------|----------------|
| **Leboncoin** | Large audience, très connue | Interface datée, pub envahissante |
| **Vinted** | UX fluide, ciblé textile | Catégories limitées |
| **Facebook Marketplace** | Intégration sociale | Dépendance à un réseau social |
| **Dealspot** | Open-source, full-stack moderne, messagerie intégrée | Projet en développement |

Dealspot se distingue par son architecture moderne (React + Node.js), sa messagerie temps réel entre utilisateurs et son système de géolocalisation des annonces via Leaflet.

### 2.3 - Technologies utilisées pour le projet

#### Frontend

- **React 19** : Bibliothèque JavaScript pour la création d'interfaces utilisateur dynamiques. Son système de composants réutilisables et son Virtual DOM permettent une UX fluide.
- **Vite 8** : Outil de build ultra-rapide remplaçant Create React App. Il offre un serveur de développement HMR (Hot Module Replacement) instantané.
- **React Router v7** : Gestion du routage côté client pour une navigation SPA sans rechargement de page.
- **Axios** : Client HTTP pour effectuer les appels vers l'API backend avec gestion centralisée des headers et des erreurs.
- **Leaflet / React-Leaflet** : Affichage de cartes interactives pour la localisation géographique des annonces.
- **React Icons** : Bibliothèque d'icônes vectorielles (Font Awesome, Material Design, etc.) intégrée nativement en React.
- **CSS modulaire** : Architecture CSS organisée par composants, orchestrée par un fichier `app.css` central.

#### Backend

- **Node.js** : Environnement d'exécution JavaScript côté serveur, non-bloquant et performant.
- **Express 5** : Framework web minimaliste pour Node.js permettant de créer des routes API REST rapidement.
- **Sequelize 6** : ORM (Object-Relational Mapper) pour Node.js permettant de manipuler la base de données MySQL via des objets JavaScript.
- **MySQL2** : Driver MySQL haute performance pour Node.js, compatible Sequelize.
- **JWT (jsonwebtoken)** : Génération et vérification de tokens d'authentification JSON Web Token pour sécuriser les routes privées.
- **bcryptjs** : Hachage sécurisé des mots de passe avant stockage en base de données.
- **Multer** : Middleware Express pour la gestion des uploads de fichiers (images des annonces).
- **Nodemailer** : Envoi d'e-mails transactionnels (confirmation d'inscription, notifications).
- **dotenv** : Chargement des variables d'environnement depuis un fichier `.env`.

#### Outils de développement

- **Visual Studio Code** : Éditeur de code principal avec extensions ESLint, Prettier, GitLens.
- **Nodemon** : Redémarrage automatique du serveur Node.js lors des modifications de fichiers.
- **MySQL Workbench / phpMyAdmin** : Administration et visualisation de la base de données.
- **Postman** : Test et documentation des endpoints de l'API REST.
- **Git / GitHub** : Versionning du code source.
- **Figma** : Conception des maquettes UI/UX.

### 2.4 - Planning du projet

| Phase | Tâche | Durée estimée |
|-------|-------|---------------|
| Phase 1 | Conception (cahier des charges, Figma, MCD/MLD) | 1 semaine |
| Phase 2 | Initialisation backend (Express, Sequelize, modèles) | 3 jours |
| Phase 3 | Développement des routes API (auth, annonces, messages) | 1 semaine |
| Phase 4 | Développement frontend (React, pages, composants) | 2 semaines |
| Phase 5 | Intégration et tests | 3 jours |
| Phase 6 | Déploiement (Vercel + ngrok) | 1 jour |

---

## 3 - Arborescence de l'application

### 3.1 - Page d'accueil – Utilisateur non inscrit

Un utilisateur non inscrit arrive sur la page d'accueil publique. Il peut :

- Consulter la liste des annonces disponibles
- Filtrer les annonces par catégorie, prix ou localisation
- Accéder à la fiche détail d'une annonce
- S'inscrire ou se connecter via le header

> Il ne peut pas envoyer de message, ajouter en favori, ni publier d'annonce.

### 3.2 - Page d'accueil – Utilisateur inscrit

Un utilisateur connecté a accès à un espace personnel enrichi :

- Tableau de bord avec ses annonces publiées
- Messagerie privée avec les autres utilisateurs
- Gestion des favoris
- Profil utilisateur modifiable
- Création et gestion de ses propres annonces

### 3.3 - Page annonce – fiche détail

La fiche détail d'une annonce affiche :

- Les photos de l'article (galerie d'images)
- Le titre, prix, catégorie, statut et description
- La localisation sur une carte Leaflet interactive
- Le profil du vendeur avec un bouton « Contacter »
- Un bouton de signalement de l'annonce

---

## 4 - Structure et modélisation de l'application

### 4.1 - Diagramme de cas d'utilisation

```
┌─────────────────────────────────────────────────────────────┐
│                        DEALSPOT                             │
│                                                             │
│  [Visiteur]                                                 │
│    ├── Consulter les annonces                               │
│    ├── Rechercher / filtrer                                 │
│    ├── Voir une fiche annonce                               │
│    └── S'inscrire / Se connecter                            │
│                                                             │
│  [Utilisateur connecté]                                     │
│    ├── Publier une annonce                                  │
│    ├── Modifier / supprimer ses annonces                    │
│    ├── Envoyer un message privé                             │
│    ├── Gérer ses favoris                                    │
│    ├── Modifier son profil                                  │
│    └── Signaler une annonce                                 │
│                                                             │
│  [Administrateur]                                           │
│    ├── Gérer les utilisateurs                               │
│    └── Traiter les signalements                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 - MCD – Modèle Conceptuel de Données

Les entités principales du projet sont :

- **User** : représente un utilisateur inscrit sur la plateforme
- **Annonce** : représente une petite annonce publiée par un utilisateur
- **Message** : représente un message privé échangé entre deux utilisateurs
- **Report** : représente un signalement d'une annonce par un utilisateur
- **Favorite** (table de liaison) : relation Many-to-Many entre User et Annonce

Relations :
- Un **User** publie plusieurs **Annonces** (1,N)
- Un **User** envoie et reçoit plusieurs **Messages** (1,N)
- Un **User** signale plusieurs **Annonces** via **Report** (1,N)
- Un **User** met en favori plusieurs **Annonces** (N,N via Favorite)
- Un **Message** est lié à une **Annonce** (1,N)

### 4.3 - MLD – Modèle Logique de Données

```
users (
  id INT PK AUTO_INCREMENT,
  pseudo VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  telephone VARCHAR(30),
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('acheteur','vendeur','admin') DEFAULT 'acheteur',
  date_inscription DATETIME DEFAULT NOW(),
  localisation VARCHAR(255)
)

annonce (
  id INT PK AUTO_INCREMENT,
  titre VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  prix DECIMAL(10,2) NOT NULL,
  date_publication DATETIME DEFAULT NOW(),
  categorie VARCHAR(50) NOT NULL,
  localisation VARCHAR(255) NOT NULL,
  statut ENUM('active','expirée','brouillon') DEFAULT 'active',
  images JSON,
  user_id INT FK → users(id)
)

messages (
  id INT PK AUTO_INCREMENT,
  sender_id INT FK → users(id),
  receiver_id INT FK → users(id),
  annonce_id INT FK → annonce(id),
  contenu TEXT NOT NULL,
  lu BOOLEAN DEFAULT FALSE,
  created_at DATETIME
)

reports (
  id INT PK AUTO_INCREMENT,
  user_id INT FK → users(id),
  annonce_id INT FK → annonce(id),
  motif VARCHAR(100),
  description TEXT,
  statut ENUM('en_attente','traité','rejeté') DEFAULT 'en_attente',
  createdAt DATETIME,
  updatedAt DATETIME
)

favorites (
  user_id INT FK → users(id),
  annonce_id INT FK → annonce(id),
  PRIMARY KEY (user_id, annonce_id)
)
```

---

## 5 - Charte graphique et présentation du Figma

### 5.1 - Charte graphique

| Élément | Valeur |
|---------|--------|
| Couleur principale | `#2563eb` (bleu) |
| Couleur d'accentuation | `#f59e0b` (amber) |
| Couleur texte | `#1a1a2e` |
| Couleur fond | `#f5f6fa` |
| Police principale | Inter, sans-serif |
| Radius des cartes | `12px` |
| Breakpoint mobile | `700px` |

#### Badges statut annonce

| Statut | Couleur |
|--------|---------|
| Active | `#58b158` (vert) |
| Vendue | `#e05959` (rouge) |
| Brouillon | `#8b8f9b` (gris) |

### 5.2 - Présentation du Figma

Les maquettes ont été réalisées sous Figma et couvrent les écrans suivants :

- Page d'accueil (desktop et mobile)
- Fiche détail annonce
- Formulaire de création d'annonce
- Page messagerie
- Page profil utilisateur
- Header avec menu burger mobile

> *(Insérer les captures Figma ici)*

---

## 6 - Développement du projet

### 6.1 - Langages et Frameworks

Pour le développement du projet, j'ai utilisé les langages et technologies suivants :

**HTML5** : Pour structurer le contenu des pages web de manière sémantique. Utilisé au travers du JSX de React.

**CSS3** : Pour le style des composants. L'architecture CSS est modulaire : chaque composant dispose de son propre fichier CSS importé dans un fichier `app.css` central.

**JavaScript (ES2022+)** : Langage principal du projet, utilisé côté frontend (React) et backend (Node.js). Les modules ES natifs (`import/export`) sont utilisés partout.

**React 19** : Bibliothèque frontend permettant de créer des interfaces dynamiques par composants réutilisables. Utilisation des hooks (`useState`, `useEffect`, `useContext`, `useRef`).

**Node.js / Express 5** : Environnement et framework backend pour créer l'API REST. Express gère le routage, les middlewares (CORS, auth, upload).

**MySQL** : Système de gestion de base de données relationnelle. Utilisé pour stocker utilisateurs, annonces, messages, signalements et favoris.

**Sequelize** : ORM permettant de définir les modèles de données en JavaScript et de synchroniser automatiquement la structure avec MySQL.

### 6.2 - Initialisation du projet

Le projet est divisé en deux parties distinctes dans le même dépôt :

**Frontend – initialisation avec Vite :**

```bash
npm create vite@latest dealspot -- --template react
cd dealspot
npm install
```

**Backend – initialisation Node.js :**

```bash
mkdir server
cd server
npm init -y
```

Puis ajout du `"type": "module"` dans `server/package.json` pour utiliser les imports ES natifs.

### 6.3 - Installation des dépendances

#### Dépendances frontend

```bash
npm install axios react-router-dom react-icons leaflet react-leaflet
```

| Package | Rôle |
|---------|------|
| `axios` | Client HTTP pour appeler l'API REST |
| `react-router-dom` | Routage SPA (Single Page Application) |
| `react-icons` | Icônes vectorielles (FaBars, FaHeart, etc.) |
| `leaflet` + `react-leaflet` | Carte interactive pour la localisation des annonces |

#### Dépendances backend

```bash
npm install express cors dotenv sequelize mysql2 bcryptjs jsonwebtoken multer nodemailer
npm install --save-dev nodemon
```

| Package | Rôle |
|---------|------|
| `express` | Framework API REST |
| `cors` | Gestion des autorisations cross-origin |
| `dotenv` | Variables d'environnement depuis `.env` |
| `sequelize` | ORM pour MySQL |
| `mysql2` | Driver MySQL pour Sequelize |
| `bcryptjs` | Hachage des mots de passe |
| `jsonwebtoken` | Authentification par token JWT |
| `multer` | Upload d'images (multipart/form-data) |
| `nodemailer` | Envoi d'e-mails (confirmation, notifications) |
| `nodemon` | Redémarrage automatique en développement |

### 6.4 - Structure des répertoires du projet

```
dealspot/
├── public/                    # Fichiers statiques publics
├── src/
│   ├── assets/                # Images et ressources statiques
│   ├── components/            # Composants réutilisables React
│   │   ├── PrivateHeader.jsx  # Header utilisateur connecté (avec burger menu)
│   │   ├── PublicHeader.jsx   # Header public
│   │   ├── ProductGrid.jsx    # Grille des annonces
│   │   └── SiteFooter.jsx     # Pied de page
│   ├── context/
│   │   └── AuthContext.jsx    # Contexte d'authentification global
│   ├── hooks/
│   │   └── useFavorites.js    # Hook personnalisé pour les favoris
│   ├── pages/                 # Pages de l'application (une par route)
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── AnnonceDetailPage.jsx
│   │   ├── CreateAnnonce.jsx
│   │   ├── MyAnnoncesPage.jsx
│   │   ├── MessagesPage.jsx
│   │   ├── FavoritesPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── UserProfilePage.jsx
│   ├── services/
│   │   └── api.js             # Instance Axios configurée
│   ├── styles/
│   │   ├── app.css            # Orchestration des imports CSS
│   │   └── components/        # CSS modulaire par composant
│   ├── App.jsx                # Composant racine + définition des routes
│   └── main.jsx               # Point d'entrée React
│
├── server/
│   ├── uploads/               # Images uploadées (servies en statique)
│   └── src/
│       ├── app.js             # Point d'entrée Express
│       ├── config/
│       │   └── database.js    # Connexion Sequelize / MySQL
│       ├── controllers/       # Logique métier par ressource
│       │   ├── auth.controller.js
│       │   ├── annonce.controller.js
│       │   ├── message.controller.js
│       │   └── report.controller.js
│       ├── middleware/
│       │   ├── auth.js        # Vérification du token JWT
│       │   └── upload.js      # Configuration Multer
│       ├── models/            # Modèles Sequelize
│       │   ├── User.js
│       │   ├── Annonce.js
│       │   ├── Message.js
│       │   ├── Report.js
│       │   └── index.js       # Relations entre modèles
│       ├── routes/            # Définition des routes API
│       │   ├── auth.routes.js
│       │   ├── annonce.routes.js
│       │   ├── message.routes.js
│       │   └── report.routes.js
│       └── services/
│           └── mail.service.js # Service d'envoi d'e-mails
│
├── index.html                 # Entrée HTML Vite
├── vite.config.js             # Configuration Vite
├── vercel.json                # Configuration déploiement Vercel (SPA routing)
└── package.json               # Dépendances frontend
```

#### Rôle des dossiers principaux

**`src/components/`** : Composants React réutilisables sur plusieurs pages. Chaque composant est responsable d'une partie de l'interface.

**`src/pages/`** : Une page par route de l'application. Chaque page est un composant React complet qui peut appeler l'API et gérer son propre état.

**`src/context/`** : Contexte React global pour partager l'état d'authentification (utilisateur connecté, token JWT) entre tous les composants sans prop drilling.

**`src/services/api.js`** : Instance Axios centralisée avec l'URL de base de l'API, l'injection automatique du token JWT dans les headers, et la gestion de l'en-tête ngrok en mode démonstration.

**`server/src/controllers/`** : La logique métier de chaque ressource (inscription, connexion, création d'annonce, etc.) est isolée dans des contrôleurs séparés.

**`server/src/middleware/`** : Middlewares Express réutilisables : `auth.js` vérifie la présence et la validité du token JWT sur les routes protégées ; `upload.js` configure Multer pour l'upload d'images.

### 6.5 - Base de données

#### Paramétrage de la connexion

La connexion à MySQL est configurée dans `server/src/config/database.js` via les variables d'environnement du fichier `.env` :

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=dealspot
DB_USER=root
DB_PASSWORD=
```

Sequelize lit ces variables et instancie la connexion :

```js
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: "mysql", logging: false }
);
```

#### Synchronisation des modèles

Au démarrage du serveur, Sequelize synchronise automatiquement les modèles avec la base de données :

```js
await sequelize.sync({ alter: true });
```

L'option `alter: true` met à jour les tables existantes sans les supprimer, ce qui est pratique en développement.

#### Entité User

```js
// server/src/models/User.js
sequelize.define("User", {
  id:              { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  pseudo:          { type: DataTypes.STRING(50), allowNull: false },
  email:           { type: DataTypes.STRING(100), allowNull: false, unique: true },
  telephone:       { type: DataTypes.STRING(30), allowNull: true },
  mot_de_passe:    { type: DataTypes.STRING(255), allowNull: false },
  role:            { type: DataTypes.ENUM("acheteur","vendeur","admin"), defaultValue: "acheteur" },
  date_inscription:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  localisation:    { type: DataTypes.STRING(255), allowNull: true }
}, { tableName: "users", timestamps: false });
```

#### Entité Annonce

```js
// server/src/models/Annonce.js
sequelize.define("Annonce", {
  id:               { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titre:            { type: DataTypes.STRING(150), allowNull: false },
  description:      { type: DataTypes.TEXT, allowNull: false },
  prix:             { type: DataTypes.DECIMAL(10,2), allowNull: false },
  date_publication: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  categorie:        { type: DataTypes.STRING(50), allowNull: false },
  localisation:     { type: DataTypes.STRING(255), allowNull: false },
  statut:           { type: DataTypes.ENUM("active","expirée","brouillon"), defaultValue: "active" },
  images:           { type: DataTypes.JSON, allowNull: true },
  user_id:          { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: "annonce", timestamps: false });
```

### 6.6 - Formulaire d'inscription

Toute personne souhaitant publier une annonce ou contacter un vendeur doit être inscrite. Le formulaire d'inscription est géré par la page `RegisterPage.jsx`.

Les champs du formulaire sont :
- **Pseudo** (obligatoire, min 3 caractères)
- **Email** (obligatoire, format valide, unique)
- **Mot de passe** (obligatoire, min 6 caractères)
- **Téléphone** (optionnel)
- **Localisation** (optionnel)

Côté backend, le contrôleur `auth.controller.js` reçoit les données, vérifie l'unicité de l'email, hache le mot de passe avec bcrypt puis crée l'utilisateur en base :

```js
// Hachage du mot de passe avant stockage
const hash = await bcrypt.hash(mot_de_passe, 12);
await User.create({ pseudo, email, mot_de_passe: hash, telephone, localisation });
```

Un e-mail de bienvenue est ensuite envoyé via le service Nodemailer.

### 6.7 - Formulaire de connexion

La page `LoginPage.jsx` permet à l'utilisateur de s'authentifier avec son email et son mot de passe.

Côté backend, le contrôleur vérifie les identifiants et retourne un **token JWT** valable 7 jours :

```js
const token = jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
```

Le token est stocké dans le `localStorage` du navigateur et injecté automatiquement dans tous les appels API suivants via l'instance Axios configurée.

L'état de connexion est géré globalement par `AuthContext.jsx` et accessible dans toute l'application via le hook `useAuth()`.

### 6.8 - Fonctionnalités du projet

#### Gestion des annonces

- **Création** : formulaire multi-champs avec upload d'images (jusqu'à 5 photos), saisie du prix, de la catégorie et de la localisation. Les images sont stockées sur le serveur dans `server/uploads/`.
- **Modification** : l'auteur de l'annonce peut modifier tous les champs et mettre à jour les images.
- **Suppression** : l'auteur peut supprimer son annonce.
- **Changement de statut** : l'annonce peut être marquée `active`, `brouillon` ou `expirée`.
- **Recherche** : filtrage par catégorie, localisation et fourchette de prix côté API.

#### Messagerie privée

La page `MessagesPage.jsx` affiche les conversations groupées par annonce. Un utilisateur peut contacter le vendeur depuis la fiche détail d'une annonce. Les messages non lus sont comptabilisés et affichés dans le header via un badge numérique.

```
GET /api/messages/conversations  → liste des conversations
GET /api/messages/:annonce_id/:user_id  → historique d'une conversation
POST /api/messages  → envoyer un message
```

#### Favoris

L'utilisateur connecté peut mettre en favori une annonce via le bouton cœur sur les cartes et fiches détail. Les favoris sont gérés par le hook `useFavorites.js` et persistés en base via l'API.

#### Signalement

Un bouton de signalement est disponible sur chaque annonce. L'utilisateur saisit un motif et une description. Le signalement est traité par un administrateur.

#### Carte interactive

Chaque annonce affiche une carte Leaflet centrée sur la localisation saisie par le vendeur, permettant à l'acheteur de situer géographiquement l'article.

### 6.9 - Sécurité et gestion des utilisateurs

#### Authentification JWT

Toutes les routes privées de l'API sont protégées par le middleware `auth.js` qui :
1. Extrait le token du header `Authorization: Bearer <token>`
2. Vérifie sa signature avec `jwt.verify()`
3. Injecte les informations du payload (`id`, `role`) dans `req.user`

```js
// server/src/middleware/auth.js
const token = req.headers.authorization?.split(" ")[1];
const payload = jwt.verify(token, process.env.JWT_SECRET);
req.user = payload;
```

#### Hachage des mots de passe

Les mots de passe ne sont jamais stockés en clair. bcryptjs est utilisé avec un facteur de coût de 12 :

```js
const hash = await bcrypt.hash(mot_de_passe, 12);
```

#### CORS dynamique

Le backend autorise uniquement les origines connues (frontend local, Vercel, ngrok) via une fonction de validation dynamique :

```js
function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (corsOrigins.includes(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.ngrok-free\.dev$/i.test(origin)) return true;
  return false;
}
```

#### Upload de fichiers sécurisé

Multer est configuré pour n'accepter que les images (JPEG, PNG, WebP) avec une taille maximale de 5 Mo par fichier.

### 6.10 - Déploiement

#### Frontend – Vercel

Le frontend React est déployé sur **Vercel**. Une configuration `vercel.json` est présente à la racine pour gérer le routage SPA :

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Sans cette configuration, un rafraîchissement de page sur une route comme `/messages` renvoie une erreur 404.

La variable d'environnement `VITE_API_URL` est définie dans le dashboard Vercel pour pointer vers le backend.

#### Backend – ngrok (démonstration)

Pour la démonstration du projet en local, le backend Node.js est exposé sur internet via **ngrok** :

```bash
# Démarrer le serveur backend
cd server && npm run dev

# Exposer le port 3000 avec ngrok
ngrok http 3000
```

ngrok génère une URL publique temporaire (ex: `https://xxxx.ngrok-free.dev`) utilisée comme `VITE_API_URL` dans le frontend.

**Gestion de l'interstitiel ngrok** : le client Axios injecte automatiquement l'en-tête `ngrok-skip-browser-warning: true` et les URLs d'images sont complétées avec le paramètre `?ngrok-skip-browser-warning=true` pour contourner la page d'avertissement ngrok sur les requêtes directes.

#### Variables d'environnement

**Frontend (`.env`) :**
```env
VITE_API_URL=https://xxxx.ngrok-free.dev
```

**Backend (`.env`) :**
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=dealspot
DB_USER=root
DB_PASSWORD=
JWT_SECRET=ma_cle_secrete
FRONTEND_URL=https://dealspot.vercel.app
```

---

## Conclusion

Le projet **Dealspot** m'a permis de mettre en pratique l'ensemble des compétences acquises durant ma formation CDA. J'ai conçu et développé une application full-stack complète, de la modélisation de la base de données jusqu'au déploiement en production.

Les principaux défis rencontrés ont été :
- La gestion du CORS entre un frontend Vercel et un backend exposé via ngrok
- La résolution des images à travers le tunnel ngrok sur appareils mobiles
- La mise en place d'un menu burger responsive sans librairie externe
- L'architecture CSS modulaire pour éviter les conflits de styles

Ce projet constitue une base solide que je pourrais faire évoluer avec des fonctionnalités comme la recherche avancée full-text, les notifications temps réel (WebSocket), ou le paiement intégré.

---

## Annexes

- **Lien GitHub** : *(insérer l'URL du dépôt)*
- **Lien Vercel** : *(insérer l'URL de déploiement)*
- **Lien Figma** : *(insérer l'URL des maquettes)*
- **Captures d'écran** : *(insérer les captures de l'application)*

---

*DOSSIER DE PROJET DEALSPOT — MARTIN VALLÉE — 2026*
