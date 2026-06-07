# TradeAI Tasks

## Main Goal

Build TradeAI as an AI-powered export-import intelligence platform for Indian exporters, importers, SMEs, consultants and trade teams.

Current focus is not random feature building. Current focus is to connect the user journey:

```txt
Landing Page
↓
Countries / Corridors / Country Pages
↓
Export Opportunity Report / Pricing
↓
Register
↓
Dashboard Personalization
↓
Buyer discovery / Report / Payment later
```

## Important Existing Docs

Do not recreate these files. They already exist inside `docs/`:

```txt
docs/API_TEST_CHECKLIST.md
docs/TESTING_WORKFLOWS.md
docs/DEPLOYMENT_STAGING.md
docs/PRODUCTION_LAUNCH_CHECKLIST.md
```

Use them for API testing, staging deployment, smoke tests and production launch checks.

## Completed Pages / Work

### Acquisition Flow

- [x] `index.html` updated for 9 target countries and corridors
- [x] `pages/register.html` updated for selected plan/source tracking
- [x] `pages/pricing.html` updated for TradeAI pricing flow
- [x] `pages/countries.html` created
- [x] `pages/corridors.html` created
- [x] `pages/export-opportunity-report.html` created

### Corridor Pages

- [x] `pages/india-kenya.html`
- [x] `pages/india-tanzania.html`
- [x] `pages/india-uganda.html`
- [x] `pages/india-rwanda.html`
- [x] `pages/india-uae.html`
- [x] `pages/india-saudi-arabia.html`
- [x] `pages/india-oman.html`
- [x] `pages/india-qatar.html`
- [x] `pages/india-china.html`

## Register Tracking Requirements

The register page should capture and preserve these values from URL query parameters and localStorage:

```txt
plan
billing
source
intent
country
product
reportType
```

Example URL:

```txt
register.html?plan=Free&source=india-kenya&intent=kenya-report&country=kenya&product=turmeric
```

## Next Priority Tasks

### 1. Contact Page Smart Prefill

File:

```txt
pages/contact.html
```

Goal:

If user opens:

```txt
contact.html?interest=enterprise&source=india-uae&country=uae
```

Then contact page should prefill or store:

```txt
interest
source
country
intent
product
reportType
```

Expected message example:

```txt
I want to discuss TradeAI enterprise plan for UAE trade intelligence.
```

Do not redesign the full contact page. Only add smart query handling, hidden fields or prefilled message logic.

---

### 2. Dashboard Personalization

Likely files:

```txt
pages/explorer-dashboard.html
js/dashboard.js
```

Goal:

After registration/login, dashboard should read:

```txt
tradeai_selected_plan
tradeai_selected_billing
tradeai_signup_source
tradeai_signup_intent
tradeai_selected_country
tradeai_selected_product
tradeai_selected_report_type
```

Dashboard should show a contextual card like:

```txt
You selected:
Country: Kenya
Product: Turmeric
Intent: Opportunity Preview

Recommended next steps:
1. Generate opportunity report
2. Explore buyer leads
3. Check HS code
4. Review documents
```

Do not create a new dashboard. Update existing dashboard flow only.

---

### 3. Sitemap

Create or update:

```txt
sitemap.xml
```

Include these important URLs:

```txt
/
pages/countries.html
pages/corridors.html
pages/export-opportunity-report.html
pages/pricing.html
pages/register.html
pages/contact.html
pages/india-kenya.html
pages/india-tanzania.html
pages/india-uganda.html
pages/india-rwanda.html
pages/india-uae.html
pages/india-saudi-arabia.html
pages/india-oman.html
pages/india-qatar.html
pages/india-china.html
```

Use this placeholder domain until final domain is confirmed:

```txt
https://tradeai.com
```

---

### 4. Robots File

Create or update:

```txt
robots.txt
```

Expected content:

```txt
User-agent: *
Allow: /

Sitemap: https://tradeai.com/sitemap.xml
```

---

### 5. Header/Footer Cleanup

Make major pages consistently link to:

```txt
Home
Countries
Corridors
Reports
Pricing
Contact
Login
Register
```

Important pages to check first:

```txt
index.html
pages/register.html
pages/login.html
pages/pricing.html
pages/contact.html
pages/countries.html
pages/corridors.html
pages/export-opportunity-report.html
```

Do not edit every page randomly. Work in small batches.

## Backend Tasks Later

Do not start these until frontend flow is stable.

Later backend work:

- Save signup metadata in User model
- Add report request model
- Add report request API
- Add admin view for report requests
- Add Razorpay checkout for paid reports
- Add AI report generation/export
- Add dashboard report history

Suggested future user metadata:

```js
signupMeta: {
  selectedPlan: String,
  selectedBilling: String,
  source: String,
  intent: String,
  country: String,
  product: String,
  reportType: String
}
```

Suggested future report request model:

```js
ReportRequest {
  user,
  product,
  country,
  corridor,
  reportType,
  status,
  paymentStatus,
  createdAt
}
```

## Do Not Touch Unless Specifically Asked

```txt
.env
backend/.env
node_modules/
backend/node_modules/
package-lock.json
payment secrets
API keys
MongoDB URI
JWT secret
existing docs inside docs/
```

## Current Priority Order

```txt
1. Update pages/contact.html smart prefill
2. Add dashboard personalization
3. Create/update sitemap.xml
4. Create/update robots.txt
5. Clean header/footer on major pages
6. Backend signup metadata later
7. Report request backend later
```

## Working Rule For Codex

For every task:

```txt
1. Read PROJECT_OVERVIEW.md, ARCHITECTURE.md, TASKS.md and CODEX_RULES.md first.
2. Identify exact files needed.
3. Explain planned changes.
4. Ask permission before major edits.
5. Edit only necessary files.
6. Summarize changed files.
7. Suggest exact next test.
```
