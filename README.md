# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Authenticated app (dashboard & features)

Routes: `/dashboard`, `/transactions`, `/budgets`, `/goals`, `/analytics`, `/recurring`, `/settings` (guarded; log in first).

- `src/data/` — demo data (swap for API calls inside `context/DataContext.jsx`)
- `src/context/` — `AuthContext` (demo session flag), `DataContext` (state + actions + formatters), `UIContext` (dialogs), `ToastContext`
- `src/components/app/` — layout shell, charts (dependency-free SVG), shared UI primitives
- `src/components/forms/` — transaction, budget, goal and recurring forms
- `src/pages/app/` — one file + one CSS file per screen
- `src/utils/` — date, format and finance helpers

Tip: open any app route with `?simulate-error` to preview the error state.

## Accounts & data storage (no backend yet)

- Accounts are stored in this browser (`monevo-users` in localStorage) by `src/utils/authStore.js`; passwords are salted and hashed with PBKDF2-SHA256, never stored in plain text. **This is client-side only and not a replacement for server auth.** `AuthContext` is the only thing the UI talks to, so a real API can replace `authStore.js` later.
- Each user's finance data and preferences are stored under `monevo:data:<userId>` / `monevo:prefs:<userId>`. New accounts start empty; Settings → Account has "Load sample data".
- Settings → Account → **Clear Account Data** removes only the signed-in user's data and preferences. **Delete account** also removes the login.
