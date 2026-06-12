# HealthAI — Smart Health Tracking Platform

AI-powered health tracking for individuals, doctors, and clinics. Snap meal photos for instant nutrition analysis, track lab results, and get personalized AI lifestyle coaching. Bilingual (English / Tiếng Việt).

## Architecture

```
Landing (/)  →  Customer Portal (/portal)  →  Pricing (/pricing)  →  Admin (/admin)
                       │
                Next.js API routes (AI + payments + proxy)
                       │
        ┌──────────────┼──────────────────┐
   Claude AI    Google Apps Script    Stripe + PayOS
  (vision +      (REST API over       (international +
   advice)       Google Sheets DB)     VietQR payments)
```

- **Zero hosting cost backend**: Google Sheets as database, Apps Script as REST API
- **Multi-tenant**: each customer gets a 6-character access code; admin manages everyone
- **AI credits**: free plan gets 5 credits/month; Pro/Clinic unlimited
- **Payments**: Stripe Checkout (cards, Apple/Google Pay) + PayOS (VietQR bank transfer)

## Setup

### 1. Backend (Google Apps Script)
1. Create a Google Sheet, copy its ID from the URL
2. Go to [script.google.com](https://script.google.com) → New project → paste `apps-script/Code.gs`
3. Project Settings → Script Properties: set `SHEET_ID`, `API_SECRET` (any random string), `ADMIN_PASSWORD`
4. Run `setupSheets()` once from the editor (authorize when prompted)
5. Deploy → New deployment → Web app → Execute as **Me**, Access **Anyone** → copy the `/exec` URL

### 2. Frontend
```bash
npm install
```
Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `GAS_URL` | Apps Script deployment URL (step 1.5) |
| `GAS_API_SECRET` | same value as Script Property `API_SECRET` |
| `ADMIN_PASSWORD` / `ADMIN_SESSION_TOKEN` | choose your own |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com/apikeys (optional) |
| `PAYOS_CLIENT_ID/API_KEY/CHECKSUM_KEY` | my.payos.vn (optional) |

```bash
npm run dev   # http://localhost:3000
```

### 3. Deploy
Vercel free tier works out of the box: `vercel --prod`. Add the env vars in Vercel project settings.

## Plans

| | Free | Pro ($7.99 / 199K VND) | Clinic ($49 / 1.2M VND) |
|---|---|---|---|
| AI analysis | 5/month | Unlimited | Unlimited |
| Patients | 1 | 1 | Unlimited |
| Trend charts | — | ✓ | ✓ |
| Practitioner dashboard | — | — | ✓ |

## Production notes
- Payment confirmation currently uses return-URL; add Stripe/PayOS **webhooks** before charging real customers
- Google Sheets handles ~thousands of customers; migrate to Supabase/Postgres beyond that (only `app/api/backend/route.ts` changes)
- This app provides wellness guidance, not medical diagnosis — keep the disclaimer visible to end users
