# FlowAI API

All protected endpoints use `Authorization: Bearer <Firebase ID token>`.

## Public

- `GET /api/health`
- `POST /api/billing/webhook` (Stripe signature required in production)

## Identity and settings

- `GET /api/auth/me`
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/settings/categories`
- `DELETE /api/settings/categories/:name`
- `GET /api/settings/export?format=json|csv`
- `DELETE /api/settings/data`

## Activation

- `POST /api/onboarding` (goal, this month's income, optional first expense)
- `POST /api/onboarding/skip`

## Core product

- `GET|POST /api/transactions`
- `PUT|DELETE /api/transactions/:id`
- `POST /api/transactions/quick-add`
- `POST /api/transactions/csv/preview`
- `POST /api/transactions/csv/import`
- `GET|POST /api/budgets`
- `DELETE /api/budgets/:id`
- `GET /api/insights/overview` (cached dashboard payload)
- `GET /api/insights/summary`
- `GET /api/insights/flow`
- `GET /api/insights/budget-status`
- `POST /api/insights/affordability`

## Pro product

- `GET /api/smart/recurring`
- `POST /api/smart/recurring/:key/dismiss`
- `DELETE /api/smart/recurring/:key/dismiss`
- `GET /api/smart/anomalies`
- `GET /api/smart/forecast`
- `GET|POST /api/goals`
- `PUT|DELETE /api/goals/:id`
- `GET /api/reports/monthly?month=YYYY-MM`
- `GET /api/billing/subscription`
- `POST /api/billing/checkout`
- `POST /api/billing/portal`

- `GET|POST /api/accounts`
- `PUT|DELETE /api/accounts/:id`

Pro endpoints return `402` with `code: "PRO_REQUIRED"` when the current profile is on the Free plan.

## Admin

- `GET /api/admin/stats`
- `GET /api/admin/users?search=`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/quotes` (public)
- Admin quote CRUD uses the same `/api/quotes` resource.
