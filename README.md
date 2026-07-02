# Highre Full-Stack Dashboard

Professional React + Express dashboard with Redis persistence, JWT auth, Chart.js analytics, and Nodemailer email flows.

## Install

```bash
npm install
```

## Environment

Copy [.env.example](.env.example) to `.env` and fill in the values.

Required values:

- `JWT_SECRET`
- `REDIS_URL`
- `VITE_API_URL`

Optional email values:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

## Run

Start Redis first:

```bash
redis-server
```

Start the backend:

```bash
npm run server
```

Start the frontend:

```bash
npm run dev
```

Run both together:

```bash
npm run dev:full
```

## Backend APIs

- `POST /register`
- `POST /login`
- `POST /forgot-password`
- `POST /reset-password`
- `GET /switches`
- `POST /switches`
- `PUT /switches/:id`
- `DELETE /switches/:id`
- `GET /chart-data`
- `POST /cluster-alert`

## Notes

- The backend uses Redis when available and falls back to in-memory storage if Redis is unreachable.
- Authentication state persists in `localStorage` so refreshes and browser navigation keep the user signed in.
- Double-click a chart point to inspect the selected timestamp below the graph.# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
