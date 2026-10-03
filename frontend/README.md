# FlowAI

FlowAI is a personal finance app: log income and expenses, set monthly budgets,
and get AI-style insights (burn rate, projections, and a purchase simulator).

## Structure

```
backend/    Express 5 API (CommonJS) + MongoDB (Mongoose)
frontend/   React 19 + Vite + Tailwind CSS 4
```

## How auth works

FlowAI uses **Firebase Authentication as the only identity provider**.

1. The frontend signs users in with Firebase (email/password or Google) via `src/context/AuthContext.jsx`.
2. `src/components/ApiProvider.jsx` attaches the Firebase ID token as `Authorization: Bearer <token>` on every request.
3. The backend verifies that token with Firebase Admin (`backend/middlewares/authMiddleware.js`) and scopes all data to `req.user._id` (the Firebase UID).

There is no separate email/password store on the server — MongoDB holds transactions and budgets only.

## Getting started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values
npm run dev            # nodemon
```

Required env vars:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `NODE_ENV` | `development` \| `production` |
| `FIREBASE_PROJECT_ID` | Firebase Admin service account |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin service account |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin service account (keep the `\n` escapes) |

Alternatively set `FIREBASE_SERVICE_ACCOUNT_JSON` to the whole service-account JSON.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Required env vars: `VITE_API_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
`VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
`VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.

The API base URL is normalized, so both `https://host` and `https://host/api` work.

## API

All routes are protected by the Firebase ID token.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/auth/me` | Returns the verified Firebase identity |
| `GET` `POST` | `/api/transactions` | List (filter/paginate) and create |
| `PUT` `DELETE` | `/api/transactions/:id` | Update / delete |
| `POST` | `/api/transactions/csv/preview` | Upload a CSV, get columns + rows |
| `POST` | `/api/transactions/csv/import` | Import mapped rows |
| `GET` `POST` | `/api/budgets` | List and create/update budgets |
| `DELETE` | `/api/budgets/:id` | Delete a budget |
| `GET` | `/api/insights/summary` | Totals, balance, month-to-date |
| `GET` | `/api/insights/budget-status` | Budgets vs. month-to-date spend |
| `POST` | `/api/insights/affordability` | "Can I afford this?" simulation |

## Security note

`backend/.env` and `frontend/.env.local` are gitignored. Never commit real
credentials. If a secret is ever committed, rotate it in the provider — removing
the file later does not remove it from git history.
