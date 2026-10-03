# FlowAI

FlowAI is a personal finance product built around one useful question: **what
can I safely do next?** It combines a Firebase-secured ledger with budgets,
purchase checks, smart spending signals, goals, reports, and a paid Pro tier.

## Project layout

- `backend/` — Express 5, MongoDB/Mongoose, Firebase Admin, Stripe-ready billing
- `frontend/` — React 19, Vite, Tailwind CSS 4, responsive product and marketing UI
- `docs/API.md` — endpoint reference
- `docker-compose.yml` — local API, web, and Mongo services

## Local development

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The local app runs at `http://localhost:5174` and the API at `http://localhost:5000`.
Firebase credentials are required for authenticated flows. Stripe variables are
optional until test-mode billing is enabled.

## Quality gates

```bash
cd backend && npm test && npm run check
cd frontend && npm run lint && npm test && npm run build
```

GitHub Actions runs those checks for every pull request and push to `main`.
