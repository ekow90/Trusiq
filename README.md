# Trusiq

Trusiq is an AI-powered trust intelligence platform for business reputation and consumer decision support.

## Project structure

```text
TRUSIQ ORIGINAL/
├── frontend/    React + Vite + TypeScript
├── backend/     Express + JWT + SQLite
├── blockchain/  Smart contract tooling
├── docs/        Planning and architecture notes
├── references/  External assets and reference tools
└── _archive/    Legacy files
```

## Local run

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Set a real JWT secret in `.env` before using the app in production.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api/*` to `http://localhost:4000`.

## Real user flow

- Create real users through the registration page.
- Login using the exact email/password you registered.
- The backend stores users in `backend/data/trusiq.sqlite`.
- Protected routes require the JWT in the `Authorization: Bearer <token>` header.

## Important notes

- No demo credentials are required for the live DB flow.
- The backend is designed for real-user onboarding and future production expansion.
- For production, move from SQLite to Postgres/MySQL and keep the JWT secret in a secure environment variable.
