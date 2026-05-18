# 📋 DealSpot - Roadmap CDA

---

## 🔴 PHASE 1 — Compléter les features orphelines

### 1. Partager (1h)

- Click "Partager" → copier URL dans le clipboard
- Toast "Lien copié!" (notification temporaire)
- Fichiers: `AnnonceDetailPage.jsx` + styles toast

### 2. Signaler (2-3h)

**Backend:**

- Model `Report` (user_id, annonce_id, motif, description, statut, created_at)
- Route `POST /api/reports` (auth required)
- Controller: validation + sauvegarde DB
- Email à l'admin (nodemailer) quand nouveau signalement ✅ fait

**Frontend:**

- Modal form: motif (select), description (textarea, min 20 chars)
- Validation client + toast success/error
- Fichiers: `Report.js`, `report.routes.js`, `report.controller.js`, `AnnonceDetailPage.jsx`, `.env`



### 3. Pagination API (2h)

**Backend:**

- `GET /api/annonces` accepte params `page` et `limit`
- Retourner `{ annonces, total, page, pages }`

**Frontend:**

- State `currentPage` + bouton "Voir plus"
- Append nouveaux items (pas remplacer)
- Fichiers: `annonce.controller.js`, `HomePage.jsx`, `PrivateHomePage.jsx`

### 4. Filtres avancés (2h)

- Prix min/max (inputs)
- Date (select: aujourd'hui / semaine / mois)
- Localisation (ville)
- Filtres envoyés en query params à l'API (pas juste frontend)
- Fichiers: `annonce.controller.js`, `HomePage.jsx`, `categories.css`

---



## 🟠 PHASE 2 — Solidifier l'app

### 5. Favoris en base (1h)

- Remplacer localStorage par une vraie table DB
- Model `Favorite` (user_id, annonce_id) avec contrainte d'unicité
- Routes: `POST /api/favorites`, `GET /api/favorites`, `DELETE /api/favorites/:id`
- Refactor hook `useFavorites.js` pour appels API
- UI identique, même comportement (optimistic update)

<!-- reprendre ICI -->

### 6. Validation complète (2-3h)

**Client:** messages d'erreur clairs sur tous les formulaires (CreateAnnonce, Login, Register)

**Serveur:** validation + sanitize sur tous les controllers (400 + message détaillé si invalide)

- Fichiers: `validation.js` (middleware), `annonce.controller.js`, `auth.controller.js`, `CreateAnnonce.jsx`, `LoginPage.jsx`

### 7. Image optimization (2-3h)

- `npm install sharp`
- Au upload: redimensionner + compresser + convertir en webp
- Créer thumbnail (200x200) + main (800x600)
- ProductGrid utilise les thumbnails, AnnonceDetailPage utilise main
- Fichiers: `upload.js` (middleware), `annonce.controller.js`, `ProductGrid.jsx`

### 8. Email verification + Forgot password (2-3h)

**Verification:**

- Register → user créé avec statut "unverified" + email avec lien token
- `GET /api/auth/verify?token=XXX` → valide token → user vérifié

**Forgot password:**

- `POST /api/auth/forgot-password` → email avec lien reset
- `POST /api/auth/reset` → valide token + hash nouveau password + login

- Fichiers: `auth.routes.js`, `auth.controller.js`, `VerifyPage.jsx`, `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`

### 8 bis. Intégration NoSQL (3-5h)

Objectif: ajouter une brique NoSQL sans remplacer MySQL ni casser la messagerie actuelle.

Contexte actuel validé:

- La messagerie existe déjà en SQL (`messages` via Sequelize)
- Il n'existe pas encore de page dédiée "Contactez-nous"

**Répartition recommandée (hybride):**

- SQL (MySQL + Sequelize): utilisateurs, annonces, auth, favoris, signalements, messagerie existante
- NoSQL: nouveau module "Contact" et/ou logs fonctionnels (soumissions, erreurs, latence)

**Option A (recommandée pour démarrer): Contact + logs en NoSQL**

- Ajouter MongoDB + Mongoose côté serveur
- Créer collection `contact_messages`
	- Champs: `email`, `sujet`, `message`, `categorie`, `status`, `createdAt`, `meta`
- API: `POST /api/contact` (public) + `GET /api/contact` (admin)
- Créer une page frontend Contact (nouvelle route)
- Ne rien modifier à la messagerie SQL existante

**Option B (évolution avancée): NoSQL aussi pour la messagerie, sans rupture**

- Garder les endpoints actuels inchangés (`/api/messages/...`)
- Introduire une couche `message.repository` avec 2 implémentations:
	- SQLRepository (existant)
	- MongoRepository (nouvelle)
- Activer un mode progressif via env (ex: `MESSAGE_STORE=sql|mongo|dual`)
- En mode `dual`: écriture SQL + Mongo, lecture SQL (sécurisé), puis bascule de lecture Mongo après validation

**Fichiers à ajouter/modifier (Option A):**

- `server/src/config/mongo.js` (nouveau)
- `server/src/models/ContactMessage.js` (nouveau)
- `server/src/controllers/contact.controller.js` (nouveau)
- `server/src/routes/contact.routes.js` (nouveau)
- `server/src/app.js` (brancher Mongo + route)
- `src/pages/ContactPage.jsx` (nouveau)
- `src/App.jsx` (nouvelle route)
- `src/services/api.js` (helpers contact)

**Fichiers à modifier en plus si Option B (messagerie):**

- `server/src/controllers/message.controller.js`
- `server/src/routes/message.routes.js` (si besoin d'admin/debug)
- `server/src/models/Message.js` (conservé, mais piloté par repository)
- `src/pages/MessagesPage.jsx` (normalement inchangé si API inchangée)

---

## 🟡 PHASE 3 — Polish

### 9. Loading states (1h30)

- Skeleton screens au lieu de "Chargement..."
- ProductGrid: 12 placeholders pendant le fetch
- AnnonceDetailPage, MessagesPage: skeletons
- Fichiers: `SkeletonCard.jsx`, `skeleton.css`

### 10. Empty states (1h)

- 0 favoris → message + CTA "Explorer les annonces"
- 0 messages → message + CTA "Contacter un vendeur"
- 0 mes annonces → message + CTA "Créer une annonce"
- 0 résultats recherche → message + CTA reset filtres
- Fichiers: `EmptyState.jsx`, toutes les pages concernées

### 11. Pages d'erreur (1h)

- Page 404 avec CTA retour accueil
- Page 500 (erreur serveur)
- ErrorBoundary React (catch erreurs runtime)
- `<Route path="*" element={<NotFound404 />} />`
- Fichiers: `NotFound404.jsx`, `ServerError500.jsx`, `ErrorBoundary.jsx`, `App.jsx`

### 12. Meta tags SEO (30min)

- `npm install react-helmet`
- Titre dynamique par page (ex: "Canapé 450€ à Paris - DealSpot")
- OG image sur AnnonceDetailPage (pour les partages)
- Fichiers: toutes les pages principales

---

## 📊 Timing estimé

| Phase | Feature | Temps |

| 1 | Partager | 1h |
| 1 | Signaler | 2-3h |
| 1 | Pagination | 2h |
| 1 | Filtres avancés | 2h |
| 2 | Favoris en base | 1h |
| 2 | Validation | 2-3h |
| 2 | Image optimization | 2-3h |
| 2 | Email verification | 2-3h |
| 2 | Intégration NoSQL | 3-5h |
| 3 | Loading states | 1h30 |
| 3 | Empty states | 1h |
| 3 | Error pages | 1h |
| 3 | Meta tags | 30min |
| **Total** | | **~21-26h** |

---

## 🗓️ Ordre de travail recommandé

JOUR 1 → Signaler (backend + frontend) + Partager
JOUR 2 → Pagination + Filtres avancés
JOUR 3 → Favoris en base + Validation
JOUR 4 → Image optimization + Loading states
JOUR 5 → Empty states + Error pages + Meta tags + Polish
JOUR 6 → Email verification + Forgot password + Tests globaux
JOUR 7 → Intégration NoSQL (Option A, puis Option B si temps)
