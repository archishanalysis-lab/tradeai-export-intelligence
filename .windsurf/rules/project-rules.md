# TradeAI Windsurf Project Rules

## Windsurf Role

Use Windsurf mainly for frontend/UI/UX work, page consistency, responsive behavior, broken links/scripts, navbar/footer/sidebar/logo consistency, and small polish tasks. Be token-conscious: inspect only the files needed for the current task.

## Project Context

TradeAI is an AI-powered export-import intelligence platform for Indian exporters, importers, SMEs, consultants, CHAs, and trade teams. The frontend is a static multipage HTML/CSS/JS app connected to a Node.js/Express backend with MongoDB, JWT auth, reports, Copilot, marketplace workflows, trade-intelligence tools, plan gating, and a Razorpay payment scaffold.

Many trade-intelligence outputs are sample, manual, rule-engine, demo, or fallback unless explicitly API-backed. Do not overclaim live official accuracy.

## Scope Rules

- Do not scan backend unless a frontend API issue requires it.
- Do not change backend, auth, payment, API, route, model, controller, service, deployment, env, or package logic unless explicitly requested.
- Do not redesign the app unless the user asks for redesign.
- Do not remove report, Copilot, saved-report, auth, or monetization behavior while doing UI cleanup.
- Prefer small, localized edits.
- Search the current page and shared CSS/JS before creating new patterns.

## Frontend Rules

- Work primarily in `pages/*.html`, `css/*.css`, `js/*.js`, and `assets/`.
- Keep navbar, footer, sidebar, logo, buttons, cards, forms, and mobile behavior consistent.
- Avoid large inline CSS duplication.
- Prefer shared CSS files such as `css/main.css`, `css/dashboard.css`, and `css/responsive.css` when appropriate.
- Keep protected pages protected with auth guard behavior.
- Public navbar should not expose protected/dashboard pages unless user is logged in.
- Keep `DEMO`, `SAMPLE`, `manual`, `fallback`, and `Rule Engine` labels visible where relevant.
- Check local script references after page edits.
- Watch for broken selectors, missing DOM nodes, and console errors.

## Backend And API Boundary

- If a UI bug is caused by an API mismatch, inspect the matching API helper and backend route before proposing changes.
- Do not invent duplicate API helpers when an existing helper can be reused.
- Do not create duplicate Copilot, report, billing, saved-item, or trade-intelligence flows.
- Never expose OpenAI, Razorpay, MongoDB, Cloudinary, JWT, or other secrets in frontend code.
- Do not weaken auth, ownership, admin, rate-limit, or payment verification behavior.

## Data Honesty Rules

- Do not claim official live tariff, duty, compliance, HS-code, customs, or country-rule accuracy unless API-backed.
- Keep disclaimers for HS code, compliance, tariff, payment, customs, and legal/financial guidance.
- TradeAI guidance is decision-support, not legal, customs, banking, or financial advice.

## Monetization UI Rules

- Do not activate real payment unless explicitly requested and Razorpay readiness is verified.
- If payment is staged, pricing buttons should route safely to register, contact, or upgrade interest.
- Guest/free/paid gates should explain value without breaking preview flow.
- Paid prompts should clearly say what is unlocked.
- Do not overstate monetization readiness.

## Security Rules

- Never commit `.env`, `backend/.env`, API keys, MongoDB URI, JWT secret, OpenAI key, Razorpay secret, Cloudinary secret, private keys, or real credentials.
- Never add hardcoded demo admin credentials.
- Do not expose private buyer/company/KYC/payment details in public UI unless intentionally allowlisted.

## Git And Workflow Rules

- Do not push or commit unless explicitly requested.
- Main branch requires manual approval.
- Do not stage `node_modules`, logs, uploads, `.env`, temp files, or generated junk.
- Remove merge conflict markers before final output.
- Keep changes reviewable and limited to the requested scope.

## Required Final Response

After edits, report:

- Files changed.
- What was fixed.
- What was not changed.
- Risks or limitations.
- Manual test checklist.
- Whether frontend browser testing is still required.

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
- Backend logs if API behavior was touched.
- Secret grep.
