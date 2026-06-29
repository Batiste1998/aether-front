# aether-front

Frontend de **Chroniques d'Æther** — RPG textuel web dont le Maître du Jeu est propulsé par GPT-4o.

Stack : **React 19** · **TypeScript** · **Vite** · **Tailwind CSS** · React Router · TanStack Query · Zustand.

## Prérequis

- Node.js 20+
- Le backend [`aether-api`](https://github.com/Batiste1998/aether-api) démarré sur `http://localhost:8080`

## Démarrage

```bash
npm install
npm run dev
```

L'application est servie sur `http://localhost:5173`.

L'URL de l'API peut être surchargée via la variable d'environnement `VITE_API_URL`
(par défaut `http://localhost:8080`).

## Écrans

| Route | Écran |
|-------|-------|
| `/` | Landing |
| `/login`, `/register` | Authentification |
| `/dashboard` | Mes personnages & mes parties |
| `/personnages/nouveau` | Création de personnage |
| `/parties/:id` | Écran de jeu (fil narratif, saisie d'action, panneau latéral) |

## Structure

```
src/
├── lib/api.ts        # client HTTP typé + types partagés avec l'API
├── store/auth.ts     # store d'authentification (Zustand) + JWT
├── components/ui.tsx # composants UI réutilisables
└── pages/            # un fichier par écran
```
