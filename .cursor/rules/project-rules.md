# TradeAI Cursor Project Rules

## Cursor Role

Use Cursor for controlled implementation, frontend/UI fixes, broken selector/script repairs, page consistency, responsive behavior, and small multi-file edits. Keep changes focused and easy to review.

## Project Snapshot

TradeAI is an AI-powered export-import intelligence platform for Indian exporters, importers, SMEs, consultants, CHAs, and trade teams. The app uses static HTML/CSS/JS frontend pages with a Node.js/Express backend, MongoDB models, JWT authentication, report workflows, Copilot, trade-intelligence tools, plan gating, and a Razorpay payment scaffold.

Many trade-intelligence features are sample/manual/rule-engine/fallback unless explicitly connected to live APIs. Cursor must not overclaim official live accuracy.

## Implementation Rules

- Prefer small, focused edits.
- Before adding files, search for existing equivalent files, services, routes, helpers, or components.
- Do not redesign UI unless the user asks for redesign.
- Do not edit backend, auth, payment, security, deployment, env, or package files without explicit user request.
- Ask before backend/security/payment changes.
- Preserve current routes and API contracts.
- Do not create duplicate Copilot, report, billing, saved-item, or trade-intelligence implementations.
- Do not remove report, Copilot, saved-report, pricing, or monetization logic during UI cleanup.
- Do not push or commit unless explicitly requested.

## Frontend Rules

- For UI/UX work, focus on `pages/*.html`, `css/*.css`, `js/*.js`, and `assets/`.
- Keep navbar, footer, sidebar, logo, buttons, cards, forms, and mobile behavior consistent.
- Avoid large inline CSS duplication.
- Prefer shared CSS files such as `css/main.css`, `css/dashboard.css`, and `css/responsive.css` when appropriate.
- Keep auth guards on protected pages.
- Public navbar should not expose protected/dashboard pages unless user is logged in.
- Maintain clear `DEMO`, `SAMPLE`, `manual`, `fallback`, and `Rule Engine` labels where applicable.
- Check for missing scripts, undefined functions, broken selectors, and console errors after frontend edits.

## Backend Boundary Rules

- Do not touch backend for frontend-only prompts.
- If a frontend bug appears to be an API mismatch, inspect the matching backend route/controller/API helper before editing.
- Do not invent backend routes if existing routes can be reused.
- Do not alter auth middleware, JWT status recheck, ownership checks, admin-only access, rate limits, or payment verification without explicit approval.
- Keep OpenAI calls backend-only.

## Security Rules

- Never commit `.env`, `backend/.env`, API keys, MongoDB URI, JWT secret, OpenAI key, Razorpay secret, Cloudinary secret, private keys, or real credentials.
- Never add hardcoded demo admin credentials.
- Demo seed must stay opt-in and never run in production by default.
- Do not expose private buyer, company, KYC, phone, email, WhatsApp, GST, IEC, or payment details publicly unless intentionally allowlisted.

## Data Honesty Rules

- Label sample, manual, fallback, demo, and rule-engine data.
- Do not claim official live tariff, duty, compliance, HS-code, customs, or country-rule accuracy unless API-backed.
- Keep disclaimers for HS code, compliance, tariff, payment, customs, and legal/financial guidance.

## Monetization Rules

- Do not activate real payment unless explicitly requested and Razorpay environment readiness is verified.
- If payment is staged, pricing actions should route safely to register, contact, or upgrade-interest flows.
- Guest/free/paid gates should explain what is unlocked without making previews feel broken.
- Do not overstate monetization readiness.

## Git And Cleanup Rules

- Do not stage `node_modules`, logs, uploads, `.env`, temp files, or generated junk.
- Remove merge conflict markers before final output.
- Main branch requires manual approval.
- Do not commit or push unless explicitly requested.

## Required Final Response

After edits, report:

- Files changed.
- What was fixed.
- What was not changed.
- Risks or limitations.
- Manual test checklist.
- Whether backend/frontend/manual browser testing is still required.

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
