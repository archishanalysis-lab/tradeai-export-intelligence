# TradeAI AI Agent Rules

## Project Overview

TradeAI is an AI-powered export-import intelligence platform for Indian exporters, importers, SMEs, consultants, CHAs, and trade teams.

The project currently includes:

- Static multipage frontend using HTML, CSS, and vanilla JavaScript.
- Node.js and Express backend.
- MongoDB models and tenant-scoped workflows.
- JWT authentication and protected dashboard pages.
- Marketplace, buyer, product, inquiry, saved-item, profile, KYC, upload, and admin flows.
- Trade Readiness Report and Export Opportunity Report workflows.
- Copilot with backend AI/rule-engine fallback.
- HS code, IEC guide, documents, compliance, tariff, country recommendation, payment risk, Incoterms, customs, logistics, communication templates, and CSV/report export features.
- Plan gating and a Razorpay payment scaffold.
- Vercel frontend and Render backend deployment.

Important truth: many trade intelligence features are sample, manual, rule-engine, or fallback unless explicitly connected to live official APIs. Never overclaim official or live accuracy.

## Core Rules

- Do not expose secrets.
- Do not edit backend unless the user asks for backend work.
- Do not redesign the UI unless the user explicitly asks for redesign.
- Preserve current routes and API contracts.
- Prefer small, focused changes over broad refactors.
- Search for existing routes, services, models, helpers, and UI patterns before adding new files.
- Do not create duplicate Copilot, report, billing, saved-item, or trade-intelligence implementations.
- Protect authentication, payment, security, ownership, and rate-limit logic.
- Use the main branch only after manual approval.
- Do not commit or push unless explicitly requested.
- After edits, report files changed and a manual test checklist.

## Security Rules

- Never commit `.env`, `backend/.env`, API keys, MongoDB URI, JWT secret, OpenAI key, Razorpay secret, Cloudinary secret, private keys, or real credentials.
- Never add hardcoded demo admin credentials.
- Demo seed must remain opt-in and must never run in production by default.
- Do not weaken auth middleware, JWT live user-status recheck, tenant isolation, `adminOnly`, ownership checks, rate limits, or payment signature verification.
- Do not make AI/report endpoints public without an explicit reason and strict rate limit.
- Do not expose phone, email, WhatsApp, GST, IEC, KYC, or private business details in public marketplace responses unless intentionally allowlisted.
- Payment changes must preserve Razorpay HMAC verification and webhook signature verification.
- OpenAI changes must happen through the backend only. Never expose API keys to frontend code.
- If Cloudinary environment variables are missing in production, keep warning behavior visible.

## Architecture Rules

- Respect the frontend/backend separation.
- Before adding files, search for an existing equivalent route, controller, service, model, API helper, or page script.
- Reuse existing models, controllers, services, and API helpers where possible.
- Keep the canonical Copilot route as the mounted protected route in `backend/routes/copilot.js` unless explicitly changed.
- Keep report generation and saved-report behavior in the existing report route/controller/model structure unless the user requests a migration.
- Keep plan slugs normalized across frontend and backend.
- Keep user/organization ownership checks for buyer, product, company, inquiry, saved-item, report, and admin data.
- Mark unused future models clearly instead of pretending they are active production features.
- Do not remove working functionality while cleaning code.

## Frontend Rules

- For UI/UX tasks, focus on `pages/*.html`, `css/*.css`, `js/*.js`, and `assets/`.
- Do not touch backend for frontend-only prompts.
- Keep navbar, footer, sidebar, logo, buttons, cards, forms, and mobile behavior consistent with existing design.
- Avoid large inline CSS duplication.
- Prefer shared CSS files such as `css/main.css`, `css/dashboard.css`, and `css/responsive.css` when appropriate.
- Do not remove report, Copilot, authentication, saved-report, or monetization logic during UI cleanup.
- Public navbar should not expose protected/dashboard pages unless the user is logged in.
- Protected pages must keep auth guard behavior.
- Maintain clear `DEMO`, `SAMPLE`, `manual`, `fallback`, and `Rule Engine` labels where applicable.
- Check browser console behavior when making frontend changes.

## Backend Rules

- For backend tasks, inspect route, controller, service, model, middleware, and validator dependencies before editing.
- Do not break existing API contracts used by frontend scripts.
- Do not invent backend routes if existing routes can be reused.
- Add validation, auth, ownership checks, and rate limits when needed.
- Keep AI/report cost-sensitive endpoints protected or strictly rate-limited.
- Preserve middleware order for raw Razorpay webhook body handling.
- Keep MongoDB access tenant-scoped unless data is explicitly public.
- Keep fallback/rule-engine behavior when OpenAI or live data keys are missing.

## Data Honesty Rules

- Always label sample, manual, fallback, rule-engine, and demo data.
- Do not claim official live tariff, duty, compliance, HS code, or country rules unless connected to official or verified APIs.
- Include disclaimers for HS code, compliance, tariff, payment, customs, and legal/financial guidance.
- TradeAI guidance is decision-support, not legal, customs, banking, or financial advice.
- Do not present demo seed data as verified live trade intelligence.

## Monetization Rules

- Do not activate real payment unless explicitly requested and Razorpay environment readiness is verified.
- If payment is staged, pricing buttons should safely redirect to register, contact, upgrade interest, or demo flows, not broken checkout.
- Guest/free/paid gates must be clear but should not hard-break public preview value.
- Free users should get preview value; paid prompts should explain what is unlocked.
- Do not overstate monetization readiness.
- Keep report download, saved history, Copilot usage, marketplace access, and advanced comparison limits consistent with the plan-gating service.

## Git And Workflow Rules

- Do not push or commit unless explicitly requested.
- Prefer feature branches or local changes; main branch requires manual approval.
- Do not stage `node_modules`, logs, uploads, `.env` files, temp files, local generated output, or unrelated junk.
- Remove merge conflict markers before final output.
- Before final output for code changes, suggest:
  - `git status`
  - `git diff --stat`
  - secret grep checks
  - local backend start
  - frontend browser test

## Required Final Report After Code Changes

Every code-changing response must include:

- Files changed.
- What was fixed.
- What was not changed.
- Risks or limitations.
- Manual test checklist.
- Whether backend, frontend, and manual browser testing are still required.

Manual checklist should include:

- Register.
- Login.
- Dashboard.
- Protected page after logout.
- Copilot.
- Trade Readiness Report or Export Opportunity Report.
- Pricing page.
- Marketplace save/remove.
- Browser console errors.
- Backend logs.
- Secret grep.
