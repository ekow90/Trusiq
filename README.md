# Trusiq

Trusiq is an AI-powered trust intelligence platform for business reputation and
consumer decision support.

## Project Structure

```text
TRUSIQ ORIGINAL/
├── frontend/    React, Vite, Tailwind CSS, React Router, Axios
├── backend/     Express, Prisma, PostgreSQL, JWT, OpenAI, Cloudinary
├── blockchain/  Hardhat, OpenZeppelin, Ethers.js, Polygon
├── docs/        Planning and architecture notes
└── _archive/    Old local setup files kept for reference
```

## Frontend Commands

Run these from `frontend/`:

```bash
npm run dev
npm run build
npm run lint
```

On this Windows machine, PowerShell currently blocks npm scripts. Use
`cmd /c npm run dev` if `npm run dev` fails in the VS Code terminal.
