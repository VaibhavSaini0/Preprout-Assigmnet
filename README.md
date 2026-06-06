# PrepRoute — Test Management Application

Frontend assignment implementation for Preproute: a 5-page test management flow with full API integration.

## Live demo

Deploy with:

```bash
npm run build
npm run preview
```

Or deploy the `dist/` folder to Vercel, Netlify, or Railway.

## Test credentials

- **User ID:** `vedant-admin`
- **Password:** `vedant123`

## Application flow

| Route | Page |
|-------|------|
| `/login` | Login with JWT stored in localStorage |
| `/dashboard` | List, search, filter, edit, view, delete tests |
| `/create-test` | Create test form with subjects, topics, marking scheme |
| `/edit-test/:id` | Edit existing test |
| `/test-view/:id` | Add/edit MCQ questions |
| `/confirmation/:id` | Preview all questions and publish |

## Stack

- React 19 + TypeScript
- Vite
- React Router
- Axios
- Context API for auth and test state
- CSS Modules + Figma design tokens

## API

Base URL: `https://admin-moderator-backend-staging.up.railway.app/api`

In development, Vite proxies `/api` to the staging server (see `vite.config.ts`).

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Project structure

```
src/
  components/   # Layout, UI, shared widgets
  context/      # Auth + test state (TestContext)
  pages/        # 5 main screens
  services/     # Axios API layer
  styles/       # Global CSS variables
```

## Design reference

[Figma — Preproute](https://www.figma.com/design/Ij7iKSIRH8berG6BJpU5Hh/Preproute)

Task requirements: `public/Frontend-Developer-Task-Preproute.md`
