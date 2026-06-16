# TradeAI Push-Ready Manual Test Checklist

Use this checklist before committing and pushing release cleanup or monetization work.

## 1. Local Backend

- [ ] Open a terminal in the project root.
- [ ] Run `cd backend`.
- [ ] Run `npm install`.
- [ ] Confirm `backend/.env` exists locally and is not committed.
- [ ] Run `npm run dev`.
- [ ] Open `http://localhost:5000/health`.
- [ ] Expect JSON with `status: "ok"` and a database state.

## 2. Local Frontend

- [ ] Open the frontend with Live Server or another static server.
- [ ] Test `index.html`.
- [ ] Test `pages/register.html`.
- [ ] Test `pages/login.html`.
- [ ] Test `pages/dashboard.html`.
- [ ] Test `pages/copilot.html`.
- [ ] Test `pages/export-opportunity-report.html`.
- [ ] Test `pages/pricing.html`.
- [ ] Test marketplace pages: `pages/companies.html`, `pages/suppliers.html`, `pages/importers.html`, `pages/products.html`.

## 3. Auth Tests

- [ ] Register a new user with a local-only test email and password.
- [ ] Login with the new user.
- [ ] Confirm dashboard loads after login.
- [ ] Logout.
- [ ] Open a protected page after logout and confirm login is required.
- [ ] Suspend the user in the database or admin panel and confirm old JWT access fails.

## 4. Copilot Tests

- [ ] Open `pages/copilot.html` while logged in.
- [ ] Ask one practical export/import question.
- [ ] Confirm response returns either OpenAI output or rule-engine fallback.
- [ ] Confirm answer labels do not claim live verified data unless OpenAI is active.
- [ ] Confirm Copilot history loads if available.
- [ ] If possible, exhaust the free Copilot limit and confirm upgrade/limit messaging.

## 5. Report Tests

- [ ] Generate a Trade Readiness Report.
- [ ] Confirm report includes product, country, direction, checklist, documents, payment risk, Incoterms, logistics, customs steps and disclaimer.
- [ ] Confirm logged-in report can be saved.
- [ ] Confirm guest preview does not save a detailed report.
- [ ] Test copy behavior.
- [ ] Test text download for a saved report.
- [ ] Test CSV download for a saved report.
- [ ] Confirm disclaimers are visible.

## 6. Trade Intelligence Tests

- [ ] HS Code Directory search works and labels sample/manual data.
- [ ] IEC/export-import starter guide loads for guest users.
- [ ] Document Checklist Finder returns mandatory and conditional documents.
- [ ] Country Compliance Finder returns sample compliance rules.
- [ ] Duty & Tariff Finder returns sample/manual tariff guidance or useful fallback.
- [ ] Country Recommendation Tool returns top recommendations and locked/upgrade messaging where applicable.
- [ ] Incoterms Advisor returns recommended Incoterms.
- [ ] Payment Risk Advisor returns safer terms, red flags and disclaimer.
- [ ] Customs Clearance Checklist returns export/import workflow.
- [ ] Logistics Planner returns route guidance without fake live freight rates.
- [ ] Trade Email Templates generate template fallback or backend AI output.
- [ ] CSV export works for supported report types.
- [ ] XLSX/PDF export is not expected unless explicitly implemented later.

## 7. Billing/Pricing Tests

- [ ] Pricing page is visible.
- [ ] Free plan routes safely to registration.
- [ ] Enterprise routes safely to contact/demo interest.
- [ ] Paid buttons do not produce a broken checkout when Razorpay env variables are missing.
- [ ] `GET /api/billing/status` works for logged-in users.
- [ ] Frontend does not call non-existent invoice or subscription-cancel endpoints.
- [ ] No real charge occurs unless Razorpay credentials are intentionally configured.

## 8. Saved Items Tests

- [ ] Save a buyer from buyer/marketplace flow.
- [ ] Save a company from marketplace flow.
- [ ] Save a product from marketplace flow.
- [ ] Open saved items and remove each saved type.
- [ ] Confirm deletion is scoped to the logged-in user and organization.

## 9. Security Checks

- [ ] Run `git status`.
- [ ] Run `git diff --stat`.
- [ ] Run `git grep -n "Password[@]123"`.
- [ ] Run `git grep -n "admin@tradeai[.]test"`.
- [ ] Run `git grep -n "sk-"`.
- [ ] Run `git grep -n "mongodb+srv://"`.
- [ ] Confirm `.env` and `backend/.env` are ignored.
- [ ] Confirm `ALLOW_DEMO_SEED[=:]true` is not present in `render.yaml`.
- [ ] Confirm demo credentials are placeholders only and set locally.

## 10. Final Push Prep

- [ ] Run backend syntax checks or targeted `node --check` commands.
- [ ] Run frontend syntax checks or targeted `node --check` commands.
- [ ] Confirm no merge conflict marker blocks remain in source files.
- [ ] Confirm no generated junk, logs, `node_modules`, `.env`, uploads or temp files are staged.
- [ ] Commit only intentional release cleanup and feature files.
