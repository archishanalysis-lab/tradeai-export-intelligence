# TradeAI User Flow Explanation

This document explains how TradeAI works from the user perspective and maps the visible flows to the real frontend, backend routes, controllers and MongoDB models in this project.

## Current Working Status

TradeAI is an MVP-stage export-import intelligence platform. The current codebase includes a static frontend, a Node/Express backend, MongoDB models, JWT authentication, role-based dashboards, marketplace previews, report generation and saved reports, Copilot guidance, admin tools, uploads and a billing/payment scaffold.

Status labels used in this document:

- Working: implemented in the current frontend/backend flow.
- Backend Connected: connected to Express routes and MongoDB models.
- Demo Data: visible fallback/sample data may appear when live data is missing.
- Future Ready: scaffold exists, but the full production business process still needs final configuration or expansion.

## Main Roles

The backend `User` model supports these roles:

- Guest / Public Visitor
- Explorer / Registered User
- Exporter
- Importer
- Consultant
- SME
- Admin

Role values are validated in `backend/models/User.js` and `backend/controllers/authController.js`.

## Public Entry Flow

### Guest / Public Visitor

Entry points:

- `index.html`
- `pages/countries.html`
- `pages/corridors.html`
- country corridor pages such as `pages/india-kenya.html` and `pages/india-uae.html`
- `pages/export-opportunity-report.html`
- `pages/pricing.html`
- marketplace preview pages such as `pages/companies.html`, `pages/suppliers.html`, `pages/importers.html`, and `pages/products.html`
- `pages/contact.html`

What they can see without login:

- TradeAI positioning and use cases
- country and corridor intelligence previews
- pricing plans
- report request and sample export opportunity report flow
- public marketplace preview pages
- contact/demo request flows

Primary calls to action:

- Start as Exporter
- Start as Importer
- Explore Countries
- Try Copilot
- View Pricing
- Request MVP Walkthrough
- Register for a report or dashboard

Status: Working for public navigation. Some marketplace and intelligence content may show demo/sample data when live backend data is unavailable.

## Registration Flow

Registration page: `pages/register.html`

Fields collected:

- full name
- email address
- company name
- account type / role
- password
- confirm password
- terms and privacy agreement checkbox

Supported role selection in the registration UI:

- explorer
- exporter
- importer
- consultant
- SME

The backend role enum also supports `admin`, but the public registration dropdown does not expose admin as a normal self-serve option. Admin accounts should be created or promoted intentionally.

Frontend flow:

1. The form reads acquisition context from query parameters and localStorage.
2. It preserves values such as plan, billing, source, intent, country, product and report type.
3. `js/auth.js` submits the registration request.
4. On success, the frontend stores the returned session.
5. The user is sent to `privacy-policy.html?from=register`.
6. The privacy confirmation section sends the user to the correct dashboard.

Backend flow:

- Route: `POST /api/auth/register`
- Route file: `backend/routes/authRoutes.js`
- Controller: `registerUser` in `backend/controllers/authController.js`
- Models: `User`, `Organization`, `CompanyProfile`, `Subscription`

Status: Working and Backend Connected.

## Login Flow

Login page: `pages/login.html`

Fields collected:

- email
- password

Frontend flow:

1. `js/auth.js` submits `POST /api/auth/login`.
2. The backend returns user details and a JWT token.
3. `js/state/authState.js` and the fallback logic in `js/auth.js` store:
   - `tradeai_logged_in`
   - `tradeai_token`
   - `tradeai_user`
   - `tradeai_token_expiry`
4. API helpers attach the token as `Authorization: Bearer <token>`.
5. The user is redirected based on role.

Backend flow:

- Route: `POST /api/auth/login`
- Controller: `loginUser`
- Model: `User`
- Utility: `backend/utils/generateToken.js`
- Middleware used later: `backend/middleware/authMiddleware.js`

Role dashboard redirects in `js/auth.js`:

- explorer -> `explorer-dashboard.html`, which redirects to `dashboard.html#overview`
- exporter -> `export-dash.html`
- importer -> `importer-dashboard.html`
- consultant -> `analytics-dashboard.html`
- SME -> `explorer-dashboard.html`
- admin -> `admin-panel.html`

Status: Working and Backend Connected.

## Protected Page / Auth Guard Flow

Protected pages are guarded by `js/authGuard.js` and `js/auth.js`.

If a user opens a protected page without a token:

1. The guard checks browser storage for `tradeai_token`.
2. If missing, it redirects to `pages/login.html`.
3. The redirect target is preserved where supported.

Role access in `js/auth.js`:

- `export-dash`: exporter or admin
- `product-dashboard`: exporter or admin
- `inquiry-dashboard`: exporter, importer or admin
- `importer-dashboard`: importer or admin
- `admin-panel`: admin only

Protected pages include dashboard/settings/saved/report/admin/product/inquiry/exporter/importer pages.

Status: Working. Fine-grained business permissions can be expanded as the product matures.

## Dashboard Flow

### Explorer / Registered User

Dashboard:

- `pages/explorer-dashboard.html` redirects to `pages/dashboard.html#overview`
- `pages/dashboard.html` is the unified dashboard shell

Sections shown:

- overview
- buyer discovery
- market analysis
- HS codes
- AI reports
- saved searches
- settings
- account summary
- recent reports
- My Reports

Frontend files:

- `pages/dashboard.html`
- `js/dashboard.js`
- `js/dashboard-tabs.js`
- `js/api.js`
- `js/api/reportApi.js`
- `js/api/savedItemApi.js`
- `js/api/billingApi.js`
- `js/buyers.js`
- `js/trade-analytics.js`
- `js/ai-reports.js`
- `js/saved-items.js`

APIs and models:

- `/api/reports/my-reports` -> `Report`
- `/api/reports` -> `AiReport`
- `/api/billing/status` -> `Subscription`, `Payment`
- `/api/saved-items` -> `SavedItem`, `SavedCompany`, `SavedProduct`
- `/api/buyers` -> `Buyer`

Status: Working and Backend Connected. Some dashboard cards show sample/fallback data when records are not available.

### Exporter

Dashboard:

- `pages/export-dash.html`

Exporter journey:

1. Register or login as exporter.
2. Land on the exporter dashboard.
3. Add products, categories, HS codes and target countries.
4. Upload product images, catalogues or certificates if needed.
5. View product analytics and matching guidance.
6. Discover buyers and manage inquiries.
7. Use country/corridor pages for market context.
8. Use Copilot for export guidance.
9. Generate or request export opportunity reports.
10. Upgrade plan when paid limits are enforced.

Frontend files:

- `pages/export-dash.html`
- `pages/product-dashboard.html`
- `pages/product-upload.html`
- `pages/inquiry-dashboard.html`
- `pages/export-opportunity-report.html`
- `js/exporter.js`
- `js/api/productApi.js`
- `js/api/inquiryApi.js`
- `js/api/uploadApi.js`
- `js/api/reportApi.js`

Backend routes and models:

- `/api/products` -> `Product`, `Subscription`
- `/api/buyers` -> `Buyer`
- `/api/inquiries` -> `Inquiry`, `Product`
- `/api/uploads/*` -> Cloudinary or local uploaded asset response
- `/api/reports/generate` -> `Report`
- `/api/reports` and `/api/reports/opportunity` -> `AiReport`
- `/api/billing/*` -> `Subscription`, `Payment`

Status: Working for MVP workflows. Some buyer matching, analytics and corridor intelligence can use demo/fallback data.

### Importer

Dashboard:

- `pages/importer-dashboard.html`

Importer journey:

1. Register or login as importer.
2. Land on importer dashboard.
3. Search suppliers, companies and products.
4. Review public company profiles and product listings.
5. Save companies or products when logged in.
6. Send inquiries for product interest where available.
7. Use Copilot for sourcing/import guidance.
8. Use marketplace pages to compare suppliers and importers.

Frontend files:

- `pages/importer-dashboard.html`
- `pages/importers.html`
- `pages/suppliers.html`
- `pages/companies.html`
- `pages/products.html`
- `pages/company-public.html`
- `js/marketplace.js`
- `js/company-public.js`
- `js/api/marketplaceApi.js`
- `js/api/savedItemApi.js`

Backend routes and models:

- `/api/marketplace/companies`
- `/api/marketplace/suppliers`
- `/api/marketplace/importers`
- `/api/marketplace/products`
- `/api/marketplace/companies/:slug`
- `/api/saved-items/companies`
- `/api/saved-items/products`
- `/api/inquiries`
- Models: `CompanyProfile`, `CompanyReview`, `Product`, `SavedCompany`, `SavedProduct`, `Inquiry`

Status: Working as MVP marketplace flow. Listings may show demo/sample cards when backend records are empty.

### SME / Small Business User

Dashboard:

- SME redirects to the explorer dashboard path.

SME journey:

1. Explore countries, corridors and report pages before registration.
2. Register as SME.
3. Use the dashboard to understand next steps.
4. Compare target countries and products.
5. Generate a sample export opportunity report.
6. Use Copilot for readiness questions.
7. Review pricing if they need more advanced features.

Value for SME users:

- reduces uncertainty about first export/import decisions
- explains target market readiness
- turns product and country ideas into a structured next-step plan
- helps identify when human verification is needed

Status: Working for acquisition, dashboard and report preview flow. Some readiness scoring is MVP/demo stage.

### Consultant / Trade Advisor

Dashboard:

- `pages/analytics-dashboard.html`

Consultant journey:

1. Register or login as consultant.
2. Review market analysis and dashboard insights.
3. Use country/corridor pages for client advisory context.
4. Use report pages to structure opportunity conversations.
5. Use Copilot for trade guidance drafts.
6. Use marketplace and saved items to support client research.

Backend routes used depend on the consultant workflow:

- `/api/trade-data`
- `/api/reports`
- `/api/marketplace/*`
- `/api/saved-items`
- `/api/copilot/ask`

Status: Available in MVP/demo/scaffold stage. Consultant-specific permissions can be expanded.

### Admin

Dashboard:

- `pages/admin-panel.html`

Admin journey:

1. Login as admin.
2. Open admin panel.
3. Review platform overview.
4. Manage users and status.
5. Review company profiles and KYC documents.
6. Verify buyers and approve products.
7. Monitor inquiries.
8. View AI reports.
9. Review contact feedback, report requests and marketplace intro requests.

Backend routes:

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `GET /api/admin/company-profiles`
- `GET /api/admin/kyc`
- `PATCH /api/admin/kyc/:id/review`
- `GET /api/admin/buyers`
- `PATCH /api/admin/buyers/:id/verify`
- `GET /api/admin/products`
- `PATCH /api/admin/products/:id/approval`
- `GET /api/admin/inquiries`
- `GET /api/admin/reports`
- report request admin routes under `/api/report-requests`

Models:

- `User`
- `CompanyProfile`
- `KycDocument`
- `Buyer`
- `Product`
- `Inquiry`
- `AiReport`
- `Contact`
- `ReportRequest`
- `MarketplaceIntroRequest`

Status: Working and Backend Connected for MVP admin review. Some operational workflows are future-ready.

## Copilot Flow

Page:

- `pages/copilot.html`

Problem solved:

TradeAI Copilot helps users ask export-import questions about markets, buyers, HS codes, documents, risks and next actions.

Frontend flow:

1. User enters a question or clicks a sample prompt.
2. `js/copilot.js` sends the prompt to the backend.
3. If a token exists, it is sent in the Authorization header.
4. The response is normalized and displayed in the Copilot answer panel.
5. If the backend or AI provider fails, frontend fallback guidance is shown and clearly labeled.

Backend flow:

- Route: `POST /api/copilot/ask`
- Route file: `backend/routes/copilot.js`
- Mounted from: `backend/server.js`
- AI provider: OpenAI when configured
- Fallback: rule-based response if OpenAI is unavailable or not configured

Note: `backend/routes/copilotRoutes.js` also exists with a protected controller-based implementation, but the mounted route in `backend/server.js` currently points to `backend/routes/copilot.js`.

Status: Working. Backend AI is connected when environment keys are available; fallback is MVP/demo-safe.

## Marketplace Flow

Pages:

- `pages/companies.html`
- `pages/suppliers.html`
- `pages/importers.html`
- `pages/products.html`
- `pages/company-public.html`

User flow:

1. Visitor or logged-in user opens marketplace pages.
2. User filters companies, suppliers, importers or products.
3. Public company detail pages show profile, products and approved reviews.
4. Logged-in users can save companies/products or post reviews where available.
5. Inquiries can connect importer interest to exporter products.

Backend routes:

- `GET /api/marketplace/companies`
- `GET /api/marketplace/suppliers`
- `GET /api/marketplace/importers`
- `GET /api/marketplace/products`
- `GET /api/marketplace/companies/:slug`
- `POST /api/marketplace/companies/:slug/reviews`
- `GET /api/saved-items`
- `POST /api/saved-items/companies`
- `POST /api/saved-items/products`
- `POST /api/saved-items/buyers`

Models:

- `CompanyProfile`
- `CompanyReview`
- `Product`
- `Buyer`
- `SavedCompany`
- `SavedProduct`
- `SavedItem`

Status: Working and Backend Connected. Empty-state sample cards are MVP/demo data.

## Payment / Plan Flow

Pages and frontend:

- `pages/pricing.html`
- `js/pricing.js`
- `js/api/billingApi.js`

Backend routes:

- `GET /api/billing/status`
- `GET /api/billing/payments`
- `POST /api/billing/checkout`
- `POST /api/billing/verify`
- `POST /api/billing/cancel`
- `POST /api/billing/webhook/razorpay`

Models:

- `Subscription`
- `Payment`
- `Organization`

Flow:

1. User selects a plan on pricing page.
2. Frontend stores selected plan/billing context.
3. If logged in, checkout can call `/api/billing/checkout`.
4. Razorpay order creation requires Razorpay environment variables.
5. Payment verification updates subscription and payment history.
6. Cancel flow downgrades subscription to free.

Status: Future Ready / Backend Connected. The billing scaffold is implemented, but live payment depends on production Razorpay configuration and final business rules.

## Report Flow

Page:

- `pages/export-opportunity-report.html`

User inputs:

- name
- email
- company
- role
- product
- HS code
- target country
- business type
- timeline or message context where available

Public report request:

- Route: `POST /api/report-requests`
- Controller: `createReportRequest`
- Model: `ReportRequest`
- Status: Working and Backend Connected.

Generated sample report:

- Frontend helper: `js/api/reportApi.js`
- Route: `POST /api/reports/generate`
- Controller: `generateSampleReport`
- Model for saved user reports: `Report`
- AI/fallback path: OpenAI when configured, rule-based MVP report when unavailable.
- If a logged-in user token is present, the generated report is saved for that user.

Saved report dashboard:

- Route: `GET /api/reports/my-reports`
- Route: `GET /api/reports/my-reports/:id`
- Model: `Report`
- Dashboard file: `pages/dashboard.html`
- Dashboard script: `js/dashboard.js`

AI report flow:

- Route: `GET /api/reports`
- Route: `POST /api/reports`
- Route: `POST /api/reports/opportunity`
- Route: `GET /api/reports/:id`
- Route: `GET /api/reports/:id/export`
- Model: `AiReport`

Status: Working and Backend Connected. Generated report content is clearly MVP/demo or AI-generated depending on provider.

## Product, Buyer, Inquiry and Upload Flow

Product flow:

- Routes: `/api/products`
- Controller: `productController`
- Model: `Product`
- Supports create, list, detail, update, delete, analytics summary and matches.
- Requires login.

Buyer flow:

- Routes: `/api/buyers`
- Controller: `buyerController`
- Model: `Buyer`
- Supports create, list, detail, update and delete.
- Requires login.

Inquiry flow:

- Routes: `/api/inquiries`
- Controller: `inquiryController`
- Models: `Inquiry`, `Product`
- Supports create, list, detail, status updates and messages.
- Requires login.

Upload flow:

- Routes: `/api/uploads/product-image`, `/api/uploads/certificates`, `/api/uploads/catalogs`, `/api/uploads/invoices`
- Controller: `uploadController`
- Service: `uploadService`
- Storage: Cloudinary when configured, local upload asset fallback otherwise.
- Requires login.

Status: Working and Backend Connected. Production-grade verification and moderation can be expanded.

## Data Flow / Technical Explanation

End-to-end request path:

1. Frontend page loads HTML from `pages/` or `index.html`.
2. `js/config.js` chooses the backend base URL.
3. `js/api.js` builds `API_URL`, attaches JSON headers and adds `Authorization: Bearer <token>` when logged in.
4. Feature-specific API files call backend paths:
   - `js/api/authApi.js`
   - `js/api/reportApi.js`
   - `js/api/billingApi.js`
   - `js/api/marketplaceApi.js`
   - `js/api/productApi.js`
   - `js/api/inquiryApi.js`
   - `js/api/savedItemApi.js`
   - `js/api/adminApi.js`
5. `backend/server.js` receives the request and routes it to `/api/...`.
6. Route files under `backend/routes/` apply validation and auth middleware.
7. Controllers under `backend/controllers/` run business logic.
8. Services under `backend/services/` call AI, matching, upload or trade data helpers.
9. Mongoose models under `backend/models/` read or write MongoDB.
10. JSON response returns to the frontend.
11. Page scripts render success, empty, fallback or error states.

## Role Value Summary

Guest / Public Visitor:

- Problem solved: understands what TradeAI does before signup.
- Immediate value: country/corridor/report/pricing previews.
- Current status: Working with MVP preview labels.

Registered Explorer:

- Problem solved: gets one dashboard to explore trade opportunities.
- Immediate value: personalized dashboard, saved reports and next actions.
- Current status: Working and Backend Connected.

Exporter:

- Problem solved: moves from product idea to target country, buyer and report workflow.
- Immediate value: product listing, buyer discovery, reports, Copilot and inquiries.
- Current status: Working with some MVP/demo intelligence.

Importer:

- Problem solved: finds suppliers, products and company profiles.
- Immediate value: marketplace search, saved items, inquiries and Copilot guidance.
- Current status: Working with sample fallback when records are empty.

SME:

- Problem solved: reduces confusion about export readiness and first market choice.
- Immediate value: guided country/corridor/report path.
- Current status: Working for acquisition and explorer dashboard.

Consultant:

- Problem solved: supports advisory research and client opportunity framing.
- Immediate value: analytics, reports, marketplace research and Copilot drafts.
- Current status: MVP/demo/scaffold stage.

Admin:

- Problem solved: monitors platform users, content, KYC, reports and requests.
- Immediate value: operational overview and review tools.
- Current status: Working and Backend Connected for MVP admin review.

## Known Limitations

- Some marketplace and dashboard records may show demo/sample fallback states when MongoDB has no live data.
- Razorpay billing requires production credentials and final plan rules before full payment launch.
- Consultant and SME flows reuse broader dashboard tools and can become more role-specific later.
- Copilot depends on backend availability and OpenAI configuration; fallback guidance is shown when live AI is unavailable.
- KYC, uploads, admin moderation and marketplace trust workflows are implemented at MVP level and need operational policy before production scale.

## Future Enhancements

- Add more role-specific onboarding for SME and consultant accounts.
- Add richer public documentation for data sources and confidence levels.
- Expand marketplace verification, reviews and inquiry workflow.
- Add plan-based feature gating across report generation, buyer unlocks and analytics.
- Add admin audit logs and deeper moderation tooling.
- Move production auth fully toward secure httpOnly cookie strategy where required by deployment policy.

## Important Files

Frontend:

- `js/config.js`
- `js/api.js`
- `js/auth.js`
- `js/authGuard.js`
- `js/state/authState.js`
- `js/dashboard.js`
- `js/copilot.js`
- `js/marketplace.js`
- `js/pricing.js`
- `pages/register.html`
- `pages/login.html`
- `pages/dashboard.html`
- `pages/export-dash.html`
- `pages/importer-dashboard.html`
- `pages/admin-panel.html`
- `pages/copilot.html`
- `pages/export-opportunity-report.html`
- `pages/pricing.html`

Backend:

- `backend/server.js`
- `backend/routes/authRoutes.js`
- `backend/controllers/authController.js`
- `backend/routes/copilot.js`
- `backend/services/tradeCopilotService.js`
- `backend/routes/marketplaceRoutes.js`
- `backend/routes/reportRoutes.js`
- `backend/routes/reportRequestRoutes.js`
- `backend/routes/billingRoutes.js`
- `backend/routes/adminRoutes.js`
- `backend/models/User.js`
- `backend/models/Product.js`
- `backend/models/Buyer.js`
- `backend/models/Inquiry.js`
- `backend/models/Report.js`
- `backend/models/AiReport.js`
- `backend/models/ReportRequest.js`
- `backend/models/Subscription.js`
- `backend/models/Payment.js`
