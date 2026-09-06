# Trusiq

Trusiq is an AI-powered trust intelligence platform for business reputation and consumer decision support.

## Project structure

```text
TRUSIQ ORIGINAL/
├── frontend/    React + Vite + TypeScript
├── backend/     Express + JWT + PostgreSQL + Prisma read helpers
├── blockchain/  Hardhat review-hash anchoring foundation
├── docs/        Planning and architecture notes
├── references/  External assets and reference tools
└── _archive/    Legacy files
```

## Local setup

Prerequisites: Node.js, Docker Desktop, and npm.

Start PostgreSQL from the repository root:

```bash
docker compose --project-name trusiq up -d postgres
```

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run dev
```

The backend uses Express, JWT, and PostgreSQL. Prisma is currently used for
selected read helpers while raw `pg` queries still handle some writes. Do not
run Prisma migrations during the current gradual migration unless explicitly
planned.

The backend `.env` must include `DATABASE_URL` and `JWT_SECRET`. `OPENAI_API_KEY`
is optional in local development; deterministic fallback analysis is used when
it is absent. Polygon and blockchain variables are also optional locally;
review hashes use deferred local-intent mode when blockchain anchoring is not
configured.

For deployment preparation, also configure `FRONTEND_URL`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, and optionally `ADMIN_USER_ID`. Run `npm run admin:bootstrap`
to create or update the configured admin without printing the password. The
admin password can later be changed through the protected admin password
endpoint; changing an existing admin ID requires an explicit foreign-key-safe
migration and is refused automatically.

Run the offline backend safety checks and syntax build with:

```bash
npm run verify:all
npm run build
```

`npm run verify:all` is offline and does not require PostgreSQL. The API smoke
test uses the real database and requires PostgreSQL plus a configured
`backend/.env`:

```bash
docker compose --project-name trusiq up -d postgres
cd backend
npm run setup:env
npm run prisma:generate
npm run smoke:api
```

`npm run setup:env` creates `backend/.env` only when it is missing; it never
overwrites an existing local environment file.

Replace the `JWT_SECRET` placeholder with a unique long random secret before
using the app in any shared or production environment.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api/*` to `http://localhost:4000`, so start PostgreSQL
and the backend before testing API-backed pages. Run frontend checks with:

```bash
npm run lint
npm run build
```

For a Render Static Site, set `VITE_API_BASE_URL` to the deployed backend URL,
or configure a Render `/api/*` rewrite. The local default remains `/api` so the
Vite development proxy continues to work.

## Real user flow

- Create real users through the registration page.
- Login using the exact email/password you registered.
- The backend stores users and application data in the PostgreSQL database configured by `DATABASE_URL`.
- Protected routes require the JWT in the `Authorization: Bearer <token>` header.

## Important notes

- No demo credentials are required for the live DB flow.
- The backend is designed for real-user onboarding and future production expansion.
- AI and blockchain integrations remain optional for local development and fail safely into fallback/deferred modes.
- Blockchain anchoring currently supports local deferred intent and an optional Polygon Amoy testnet path using free-tier RPC configuration and test MATIC. Mainnet/commercial anchoring is not enabled. Never commit wallet private keys.
