# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Pour démarrer le projet

1. Démarrer le front:
    npm run dev : depuis la racine

2. Démarrer le server:
    à la maison, ne pas oublier de lancer xampp
    se placer dans le dossier server: cd server
    npm run dev: depuis le dossier server

3. Pour utiliser ngrok:
    ngrok http 4000
    on récupère l'url et on ajoute /api a la fin
    exemple: http://localhost:4000/api
    puis on ajoute le lien dans vercel (varaible VITE_API_URL)
    on redeploie le projet
    pour charger les images, cliquer sur une image et cliquer sur visiter le site