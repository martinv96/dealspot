# Tests serveur DealSpot

Ce dossier contient une base de tests Node.js pour le backend DealSpot.

## Lancement

- Tous les tests: `npm run test`
- Tests unitaires: `npm run test:unit`
- Tests securite: `npm run test:security`

## Contenu

- `tests/unit/validation.test.js`: tests unitaires des validateurs backend.
- `tests/unit/auth.middleware.test.js`: tests unitaires du middleware JWT.
- `tests/security/input.security.test.js`: tests de securite sur des entrees malveillantes (SQL-like et donnees invalides).

Ces tests sont concus pour etre executes sans base de donnees active.
