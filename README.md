# aether-front

Frontend de **Quiz d'Æther** — un jeu de quiz de culture générale dont les questions sont générées par GPT-4o.

Stack : **React 19** · **TypeScript** · **Vite** · **Tailwind CSS** · React Router · TanStack Query · Zustand.

## Prérequis

- Node.js 20+
- Le backend [`aether-api`](https://github.com/Batiste1998/aether-api) démarré sur `http://localhost:8080`

## Démarrage

```bash
npm install
npm run dev      # http://localhost:5173
```

`VITE_API_URL` permet de surcharger l'URL de l'API (défaut `http://localhost:8080`).

## Écrans

| Route | Écran |
|-------|-------|
| `/` | Landing |
| `/login`, `/register` | Authentification |
| `/dashboard` | Lobby : choix du thème/catégorie, difficulté, nombre de questions |
| `/quiz` | Partie en cours : chrono, choix, feedback, écran de résultats |
| `/classement` | Classement des meilleurs scores |

## Structure

```
src/
├── lib/api.ts        # client HTTP typé + types partagés avec l'API
├── lib/stats.ts      # helpers purs (réussite, chrono) + tests
├── store/auth.ts     # store d'authentification (Zustand) + JWT
├── components/ui.tsx # composants UI réutilisables (boutons, header…)
└── pages/            # un fichier par écran
```

## Qualité

```bash
npx tsc --noEmit
npm test            # vitest
npm run build
```

CI GitHub Actions à chaque push (typecheck, tests, build).
