# FlowAI Scale Plan

Status: in progress
Date: October 2026

## Progress log

- Fixed the invisible top-right account control and added Goals, Accounts, and Reports to nav.
- Raised the global API limit from 100 to 600 requests per 15 minutes.
- Split authenticated routes; initial JS is now **145 KB gzip**, down from 313 KB.
- Replaced eight dashboard calls with one cached `GET /api/insights/overview`.
- Cached overview responses for 30 seconds and invalidated them on every transaction write.
- Fixed the O(n^2) anomaly scan and the profile creation race for new users.
- Shipped a 60-second onboarding flow with goal, income, first expense, and first read.
- Added onboarding skip.
- Shipped a Pro subscription watchdog with monthly/yearly cost, next charge,
  confidence, review checklist, persistent dismissal, and undo.
- Pro-only pages no longer call Pro APIs for free users.
- Added a weekly recap with current vs previous week, top category, and one action.
- Added one-click "Log spending" from the dashboard into the new-entry form.
- Fixed mobile bottom-nav pinning and the page transition containing block.
- Fixed dark-mode primary-button contrast with a dedicated contrast token.
- Wired the Reports "Print / save" button to a clean print layout.
- Rebuilt Reports as a proper document with print header, summary, totals, and footer.
- Changed dark mode to a near-black layered theme.
- Made the desktop sidebar stay visible on scroll and on short screens.
- Replaced the crowded mobile nav with five tabs plus a labeled "More" sheet.
- Removed the motivational quote from the dashboard to improve credibility.
- Replaced the fake "Money health" score with a projected keep/shortfall figure.
- Added a first-run dashboard setup card for zero-data accounts.
- Reached zero WCAG A/AA violations across all pages in both themes.
- Added a real FlowAI favicon, PWA icons, shortcuts, and corrected SEO metadata.
- Added `docs/MONETIZATION-ASSESSMENT.md` with the honest pay-readiness review.
- Added 11 backend tests.

## 1. What FlowAI already has

FlowAI has a real product, not a demo:

- Firebase authentication and MongoDB-backed user data.
- Manual transactions, CSV import, budgets, purchase check, and flow charts.
- Pro goals, accounts, monthly reports, recurring-payment detection, anomaly signals,
  and forecasting.
- Admin workspace for users, plans, and quotes.
- Dark mode, responsive layout, PWA manifest, and offline shell.
- Backend authorization for Pro and admin routes.

The foundation is good. The next problem is not "more screens". It is **time to first
value, repeat use, and a reason to pay every month**.

## 2. Market reality (checked October 2026)

- Paid competitors cluster at **$95-$110 per year**: Monarch, Copilot, YNAB, Origin.
- Rocket Money keeps a free tier and monetizes bills; Cleo starts around $6/month.
- AI chat is becoming table stakes. The differentiator is **action and measurable
  outcomes**, not another chat box.
- Bank aggregation is the expensive layer. Industry analysis puts multi-provider
  aggregation in the **$180k-$360k/year range at 10k users**. Do not switch it on
  before the unit economics work.
- Retention is the category's hardest problem. Day-30 retention for finance apps is
  commonly reported in the **4-8%** range. Products that produce a concrete outcome
  retain better than pure trackers.

That leaves a clear opening for FlowAI: **the fastest, most private way to know what
you can safely spend, with an AI that acts like a money chief of staff, not a chatbot.**

## 3. Positioning

### One-line promise

> FlowAI tells you what you can safely spend today, without a bank login, in 60 seconds.

### Who it is for

Start with one narrow user, not "everyone":

- 22-40, salaried or freelancing, anxious about money.
- Does not want a zero-based budgeting method.
- Wants one number and a short explanation, not a spreadsheet.
- Cares about privacy and does not want to hand over bank credentials on day one.

### Why it wins

1. **Private by default** - manual, CSV, receipt, or read-only connection. The user chooses.
2. **One number that matters** - Safe to Spend, updated every day.
3. **Proactive, not passive** - the app surfaces the bill, leak, or decision before the user asks.
4. **Action with permission** - propose a budget change, cancellation, or savings move; never surprise the user.
5. **Fast** - useful before a competitor finishes its bank-linking flow.

## 4. Product roadmap

### P0 - next 30 days (activation and habit)

| Feature | Why it matters | Effort |
| --- | --- | --- |
| 60-second onboarding | Three questions, first insight immediately; no empty dashboard. | M |
| Safe to Spend card + daily push | A daily habit instead of a monthly check-in. | S |
| Weekly "money minute" recap | Three numbers and one action by email or push. | S |
| Natural-language quick add + voice | Quick add everywhere; voice for hands-free capture. | M |
| Receipt / statement scan | Extract merchant, amount, and date without a bank login. | M |
| AI copilot v1 | Grounded answers on the user's data, with the numbers shown. | M |
| Subscription watchdog | Detect recurring charges, annual cost, renewal reminders. | S |
| First-value analytics | Signup, first transaction, first insight, return, upgrade. | S |

### P1 - days 31-90 (retention and monetization)

| Feature | Why it matters | Effort |
| --- | --- | --- |
| Shared household | Free partner seat; strong retention and word of mouth. | L |
| Predictive cashflow calendar | Balance and bills by date; the next 30 days at a glance. | M |
| Scenario simulator | Show the trade-off before a decision, not after. | M |
| Debt payoff planner | Snowball/avalanche with a clear payoff date. | M |
| Net worth + trend | Manual accounts and cards on one balance sheet. | S |
| AI categorization from corrections | Learn from every edit; proprietary and sticky. | M |
| Bank sync (optional, read-only) | Optional read-only connection behind a waitlist. | L |

### P2 - days 91-180 (moat and scale)

- Native iOS/Android shell with widgets, biometric unlock, and push.
- Agentic actions: set budgets, pause a subscription reminder, create a savings rule,
  all with explicit approval and an audit trail.
- Financial health score and streaks, based on outcomes rather than screen time.
- Multi-currency and travel mode.
- Integrations: Google Sheets, Notion, Apple Shortcuts, Telegram/WhatsApp.
- White-label or credit-union partnership for distribution.

## 5. Speed: fixed and remaining

Fixed in this sprint:

- Production initial JS: **145 KB gzip**, down from 313 KB.
- Dashboard: **one cached overview request** instead of eight unique calls.
- Global API limit: 600 per 15 minutes, up from 100.
- Anomaly detection: single-pass statistics instead of O(n²).
- Profile creation: atomic upsert, no duplicate-key 500 for new users.
- Framer Motion removed; CSS page transitions are lighter.

Still to fix, in order:

| Fix | Expected result |
| --- | --- |
| Restrict `getSummary` to current + last month, or precompute monthly rollups | Large CPU reduction at scale |
| Cache profile lookups for 60s | Removes duplicate MongoDB reads per view |
| `compression()` + ETag on GET responses | Lower bandwidth and faster mobile loads |
| Keyset pagination; remove `countDocuments` from each page | Stable performance at 100k+ transactions |
| Server-side CSV import, streamed export | No browser round-trip, no event-loop stall |
| Add React Query or a small request cache | Dedupe, background refresh, optimistic updates |
| PWA precache + offline transaction queue | Fast repeat opens and offline capture |
| Redis for rate limits/cache/jobs at multi-instance scale | Correct limits and shared cache |
| Sentry + structured logs + uptime checks | Find regressions before users report them |

Targets: **p95 API under 300 ms**, **LCP under 2.5 s on mid-range mobile**, **initial
JS under 150 KB gzip**, **zero `429`s in a normal session**.

## 6. What makes FlowAI "needed"

The daily loop should be:

1. Morning: one push - "You can spend $34 today. Rent is in 4 days."
2. During the day: one-tap or voice capture. No forms.
3. Evening or week-end: a two-minute recap with one action.
4. Monthly: a clear outcome - "You kept $212 more than last month."

Every feature should pass one of these tests:

- Does it reduce the time to the first useful answer?
- Does it bring the user back without guilt?
- Does it produce a measurable outcome the user can repeat?
- Does it make the next month easier than this month?

Trust rules:

- Read-only by default. Never move money without explicit permission and licensing.
- Show the numbers behind every AI answer.
- Plain-language privacy page: what is stored, what is never sold, how to delete it.
- One-click export and account deletion.
- No "financial advice" claims. Use "guidance" and show assumptions.

## 7. Pricing

Current price is **$5/month or $45/year**. That is well below the $95-$110 annual
market. Three options:

| Option | Price | When to use |
| --- | --- | --- |
| A. Keep early-adopter price | $5/mo, $45/yr | Grandfather early users; simple, but leaves money on the table |
| B. Market entry | $7.99/mo, $59/yr | Recommended default; annual-first, 25% annual saving |
| C. Premium | $12.99/mo, $89/yr | Only after bank sync, household, and agentic actions ship |

Recommended: **B**, with a student plan and a 14-day Pro trial. Keep the current $5
price for existing users and call it "Founding Member". Do not raise the price before
the onboarding and retention fixes land; otherwise churn will hide the signal.

## 8. Go-to-market plan

### Phase 0 - week 1-2: make the funnel measurable

- Add analytics events for signup, onboarding step, first transaction, first insight,
  return visit, Pro gate view, checkout start, checkout complete.
- Build the 60-second onboarding.
- Ship the performance fixes above.
- Add a public changelog and a real privacy page.

### Phase 1 - week 3-6: earn the second visit

- Launch daily Safe to Spend and weekly recap.
- Launch AI copilot and subscription watchdog.
- Add referral: one free Pro month for both sides.
- Start a "money minute" content series with real, anonymized examples.

### Phase 2 - month 2-3: distribution

- Free SEO tools: Safe-to-Spend calculator, subscription audit, debt payoff date,
  "cost of your daily coffee" calculator. Each tool ends in a FlowAI account.
- Creator affiliates: 30-40% recurring commission for finance creators.
- Product Hunt, relevant subreddits, student communities, and a launch waitlist.
- Test $7.99/$59 pricing with a small cohort before a full switch.

### Phase 3 - month 4-6: moat

- Add optional read-only bank sync and household seats.
- Ship native apps or a high-quality installable PWA with widgets.
- Partner with credit unions, payroll platforms, or student organizations.
- Only then test paid acquisition, with a hard CAC payback ceiling.

### Metrics that decide the next move

| Metric | Target |
| --- | --- |
| Activation: first transaction + first insight within 10 min | 60% |
| D1 / D7 / D30 retention | 40% / 20% / 10% |
| WAU / MAU | 35%+ |
| Free to Pro conversion | 3% |
| Monthly churn | under 5% |
| CAC payback | under 3 months |
| NPS | 40+ |
| p95 API | under 300 ms |

## 9. 14-day execution list

| Day | Work |
| --- | --- |
| 1-2 | Navbar visibility fix, rate-limit fix, lint/build/tests, analytics events |
| 3-4 | Route lazy loading, vendor chunks, bundle check |
| 5-6 | `GET /api/overview` + per-user cache; remove redundant dashboard calls |
| 7 | 60-second onboarding with first insight |
| 8 | Safe to Spend card + PWA push permission flow |
| 9-10 | AI copilot v1 grounded in user data |
| 11 | Weekly recap email/push |
| 12 | Subscription watchdog UI + cancellation guidance |
| 13 | Pricing page experiment and Founding Member path |
| 14 | Funnel review; decide bank sync vs receipt scan next |

## 10. Decisions needed

1. **Bank sync**: build now, or after 1,000 activated users? Recommendation: wait,
   ship receipt/statement scan first, and keep manual entry strong.
2. **Primary audience**: students, young professionals, freelancers, or couples?
   Recommendation: young professionals first; couples after household seats.
3. **Pricing**: keep $5, or move to $7.99/$59? Recommendation: $7.99/$59 with
   grandfathering.
4. **Native apps**: now or after retention? Recommendation: PWA now, native after
   D30 retention is above 10%.
5. **AI budget**: which provider and what monthly cost ceiling per user? Recommendation:
   small model for categorization, larger model only for copilot answers, hard cap per user.

## 11. Guardrails

- Never claim guaranteed savings or investment returns.
- Never present AI output as regulated financial advice.
- Encrypt data in transit and at rest; keep Firebase and MongoDB access least-privilege.
- Publish a clear data policy and a one-click delete path.
- Set a monthly infrastructure ceiling before enabling bank sync or paid ads.
- Run `npm audit` in CI; the current installs report high-severity transitive issues.
- Load-test before launch: k6 target 500 RPS, p95 under 300 ms.

## 12. Market references

- AI personal finance comparison, prices checked October 2026: candor.money
- Plaid, "The state of intelligent finance", Spring 2026
- Luminix, personal finance competitive analysis, February 2026
- Mordor Intelligence, personal finance tools market report, 2026
- Plaid consumer AI readiness survey, 2026

Verify every price and provider term before publishing or charging.
