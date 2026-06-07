# TradeAI

TradeAI is an AI-powered export-import intelligence platform for Indian exporters, importers, SMEs, consultants, and trade teams.

The platform helps users discover export-import opportunities, compare product-country potential, identify buyer and supplier leads, understand HS-code risks, generate AI-powered trade reports, and manage trade workflows.

TradeAI is intended to become a practical B2B SaaS and intelligence platform for export-import businesses.

---

## What TradeAI Does

TradeAI helps users with:

- Export opportunity discovery
- Product-country market comparison
- Buyer and supplier lead discovery
- HS-code intelligence
- AI-powered trade reports
- Document checklist guidance
- Trade workflow management
- Import/sourcing intelligence

---

## Phase 1 Target Corridors

### India → East Africa

Target countries:

- Kenya
- Tanzania
- Uganda
- Rwanda

Purpose:

- Export opportunity discovery
- Buyer and distributor discovery
- Product-country reports
- HS-code and document readiness guidance

### India → Gulf / GCC

Target countries:

- UAE
- Saudi Arabia
- Oman
- Qatar

Purpose:

- Premium export market discovery
- Buyer and distributor discovery
- Re-export and Gulf market intelligence
- Product-country scoring

### India ↔ China

Purpose:

- Sourcing intelligence
- Import dependency analysis
- Supplier comparison
- Price benchmarking
- Product-category tracking

---

## Tech Stack

### Frontend

- HTML
- CSS
- JavaScript
- Static pages

### Backend

- Node.js
- Express.js
- MongoDB
- JWT authentication

---

## Important Folders

```txt
pages/
css/
js/
backend/
docs/
assets/
```

---

## MVP Pages Completed

### Core Pages

- `index.html`
- `pages/register.html`
- `pages/login.html`
- `pages/pricing.html`
- `pages/countries.html`
- `pages/corridors.html`
- `pages/export-opportunity-report.html`
- `pages/contact.html`

### Corridor Pages

- `pages/india-kenya.html`
- `pages/india-tanzania.html`
- `pages/india-uganda.html`
- `pages/india-rwanda.html`
- `pages/india-uae.html`
- `pages/india-saudi-arabia.html`
- `pages/india-oman.html`
- `pages/india-qatar.html`
- `pages/india-china.html`

---

## Backend Modules

Current backend modules include:

- Auth
- Buyers
- Products
- Inquiries
- Trade data
- Copilot
- Uploads
- Admin
- Billing scaffold

---

## Run Frontend Locally

Use Live Server from the project root.

Open:

```txt
index.html
```

or any page inside:

```txt
pages/
```

through Live Server so relative CSS and JavaScript paths load correctly.

Example local URL:

```txt
http://127.0.0.1:5500/index.html
```

---

## Run Backend Locally

```bash
cd backend
npm install
npm run dev
```

Default backend URL:

```txt
http://localhost:5000
```

---

## Environment Variables

Do not commit:

```txt
.env
backend/.env
```

Environment-specific values such as database URLs, JWT secrets, API keys, payment secrets, and cloud service credentials must stay out of source control.

Examples of sensitive values:

- `MONGO_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `COMTRADE_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_SECRET`

Use `.env.example` files for safe placeholders only.

---

## Existing Documentation

Important project documentation exists in:

```txt
docs/
```

Useful files:

- `docs/API_TEST_CHECKLIST.md`
- `docs/TESTING_WORKFLOWS.md`
- `docs/DEPLOYMENT_STAGING.md`
- `docs/PRODUCTION_LAUNCH_CHECKLIST.md`

---

## Current MVP Status

TradeAI currently has:

- Static frontend acquisition flow
- 9 target country/corridor pages
- Countries hub page
- Corridors strategy page
- Export opportunity report page
- Pricing page
- Register/login flow
- Contact/demo smart prefill support
- Dashboard personalization using acquisition metadata
- Backend scaffold for core trade workflows

The MVP is currently focused on user acquisition, lead capture, report requests, and conversion readiness.

---

## MVP Review Scope

This is a private MVP review repository. Demo pages may include sample or fallback data, and backend/API features may be in local or staging status while stakeholder feedback is gathered.

Review focus:

- Product clarity
- UI flow
- MVP scope
- Buyer/supplier journey
- Export opportunity report
- Dashboard usefulness
- Security risks
- Stakeholder feedback

Do not commit or request real `.env` values. Reviewers should use `.env.example` only for setup reference.

Deployment/reviewer note:

- Frontend preview link: `TBD`
- Backend status: `Local/staging; not fully deployed for public use`
- Environment warning: real API keys and secrets are not included
- Reviewer instruction: focus on MVP feedback, not production perfection

Stakeholder feedback flow:

- Use `pages/contact.html` to send MVP review feedback.
- Reviewers can comment on UI, product flow, business model, marketplace, dashboards, pricing, technical risks, partnerships, and the export opportunity report.
- If the contact API is unavailable during preview, share feedback directly with the founder or retry after backend deployment.

---

## Next Tasks

Short-term tasks:

- Create/update `sitemap.xml`
- Create/update `robots.txt`
- Clean header/footer links on major pages
- Perform local smoke testing
- Push safe version to GitHub

Later backend tasks:

- Save signup metadata in backend user model
- Add report request backend model
- Add report request API
- Add admin view for report requests
- Add Razorpay/payment integration
- Add AI report generation/export flow

---

## Safety Notes

No secrets should be committed.

Do not commit:

- API keys
- MongoDB URIs
- JWT secrets
- Cloudinary secrets
- Razorpay secrets
- `.env`
- `backend/.env`
- `node_modules/`

Before pushing to GitHub, always check:

```bash
git status
git diff --cached
```

---
