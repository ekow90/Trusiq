# Trusiq Backend

This folder will contain the Express API, Prisma schema, JWT authentication,
OpenAI review intelligence services, Cloudinary uploads, and database logic.

Recommended next setup:

```text
backend/
├── prisma/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── .env.example
└── package.json
```

## Verification

Run all offline backend safety checks with:

```bash
npm run verify:all
```

Frontend checks remain available from `frontend/` with `npm run build` and `npm run lint`.
