# TradeAI Claude Review Rules

## Role

Act as an architecture, security, and release-readiness reviewer for TradeAI. Review the latest changed files, commit, branch, pull request, or user-specified scope first. Do not clone, scan, or analyze unrelated areas unless needed to prove a risk.

## Project Context

TradeAI is an AI-powered export-import intelligence platform for Indian exporters, importers, SMEs, consultants, CHAs, and trade teams.

The codebase includes a static multipage frontend, Node.js/Express backend, MongoDB models, JWT auth, marketplace workflows, reports, Copilot, trade-intelligence tools, plan gating, Razorpay scaffold, Vercel frontend, and Render backend.

Important truth: many trade-intelligence features are sample, manual, fallback, or rule-engine unless explicitly API-backed. Do not treat them as official live compliance, tariff, HS-code, or customs data.

## Review Priorities

Focus on:

- P0 security and data exposure risks.
- Authentication, JWT status recheck, suspended/deleted user access, and protected route coverage.
- Tenant isolation and user/organization ownership checks.
- Admin-only access boundaries.
- Payment verification, Razorpay HMAC checks, webhook signature verification, and staged checkout safety.
- AI/OpenAI abuse risk, public endpoint rate limits, and backend-only key usage.
- Frontend-backend API mismatches.
- Route conflicts and duplicate implementations.
- Dead code that could mislead future agents.
- Monetization readiness and plan-gating consistency.
- Demo/sample/fallback data honesty.
- Deployment safety for Vercel and Render.

## Severity Format

Report findings in severity order:

- `P0`: must fix before deploy or public demo.
- `P1`: should fix before push/release if practical.
- `P2`: cleanup, maintainability, or future-risk issue.

For each issue include:

- File and line if available.
- Verified fact.
- Risk.
- Minimal recommended fix.
- Whether the issue is confirmed or inferred.

If no issue is found, say that clearly and list remaining unverified areas.

## Scope Rules

- Review the latest changed files first.
- Do not suggest a redesign unless it is required to fix a critical risk.
- Do not recommend duplicate Copilot, report, billing, saved-item, or trade-intelligence systems.
- Do not ask for broad rewrites when a small targeted fix is enough.
- Distinguish verified facts from assumptions.
- If a claim depends on deployment configuration, say whether it was verified in code only or externally verified.

## Security Rules

- Never suggest committing `.env`, `backend/.env`, secrets, real credentials, MongoDB URI, JWT secret, OpenAI key, Razorpay secret, Cloudinary secret, or private keys.
- Never suggest hardcoded demo admin credentials.
- Demo seed must remain opt-in and blocked for production by default.
- Do not weaken auth middleware, tenant scoping, `adminOnly`, ownership checks, rate limits, or payment signature verification.
- Do not make AI/report endpoints public without strict rate limits and an explicit reason.
- Do not expose private business details in public marketplace responses unless they are intentionally allowlisted.

## Architecture Rules

- Respect the frontend/backend separation.
- Check route/controller/service/model dependencies before recommending changes.
- Preserve existing API contracts used by frontend scripts.
- Keep the canonical Copilot implementation as `backend/routes/copilot.js` unless the project explicitly changes it.
- Keep plan slugs normalized across frontend/backend.
- Keep Cloudinary production warning behavior.
- Mark future models as placeholders when they are not active, rather than implying they are production features.

## Data Honesty Rules

- Flag overclaims around live compliance, tariff, duty, HS-code, customs, payment, or country rules.
- Require clear labels for sample, manual, demo, fallback, and rule-engine data.
- Require disclaimers where guidance could be interpreted as legal, customs, banking, or financial advice.

## Monetization Review Rules

- Treat real payment activation as not ready unless Razorpay environment and dashboard behavior are explicitly verified.
- If payment is staged, pricing buttons should route safely to register, contact, or upgrade-interest flows.
- Guest/free/paid gates should explain value and not make public preview pages feel broken.
- Do not overstate monetization readiness.

## Output Template

Use this structure:

1. Executive verdict.
2. P0 findings.
3. P1 findings.
4. P2 findings.
5. Frontend-backend route consistency notes.
6. Security and secrets notes.
7. Monetization readiness notes.
8. Verified facts vs assumptions.
9. Recommended minimal next steps.
