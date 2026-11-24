# Web analytics (Google Analytics 4)

## Why GA4

- Free traffic and **source** reporting (LinkedIn, Google, direct, etc.)
- Page views, geography, sessions, new vs. returning visitors
- **`sign_up`** events when users create accounts (after they accept analytics cookies)

## Setup

1. [Google Analytics](https://analytics.google.com/) → **Admin** → **Create property** for `rewardologyacademy.com`.
2. **Data stream** → Web → copy **Measurement ID** (`G-XXXXXXXXXX`).
3. Add to Netlify → **Environment variables** → `GA_MEASUREMENT_ID` = that value (Builds, Functions, Runtime). Or run `node scripts/setup-ga4-production.mjs` with `NETLIFY_AUTH_TOKEN` and `GA_MEASUREMENT_ID` in `.env.local`.
4. Deploy production, visit the site, **Accept analytics** on the cookie banner (required for EU/GDPR).
5. In GA4 → **Admin** → **Events**, mark **`sign_up`** as a **Key event** (conversion).

## Local dev

Set `GA_MEASUREMENT_ID` in `.env.local` / Netlify, or omit to disable analytics entirely.

## Alternatives

- **Netlify Analytics** — no code, $9/mo, no referrer/source detail.
- **Plausible** — privacy-first, paid; no cookie banner if you prefer that trade-off.