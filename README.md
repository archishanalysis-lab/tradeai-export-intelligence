# TradeAI

TradeAI is an AI-powered export-import intelligence platform designed for Indian exporters, importers, SMEs, consultants, and trade teams.

The platform is built as a research prototype and MVP-stage implementation for export market intelligence, buyer and supplier discovery, HS-code intelligence, trade-report generation, and import-export workflow support.

TradeAI is intended to demonstrate how artificial intelligence, trade data, market comparison, corridor analysis, and digital workflow tools can be combined into a practical B2B export-import intelligence system.

---

## Research Context

This repository contains supplementary implementation material related to research on AI-driven export market intelligence and buyer discovery.

The prototype supports the research objective of exploring how AI-enabled systems can assist exporters and importers in:

* Discovering product-country opportunities
* Identifying potential buyers and suppliers
* Comparing trade corridors
* Understanding HS-code and product-category risks
* Generating AI-assisted trade reports
* Supporting export-import decision workflows
* Structuring digital trade intelligence for MSMEs

This repository is provided for academic transparency, technical demonstration, and research-aligned product development. It is not presented as a fully commercial production deployment.

---

## What TradeAI Does

TradeAI is designed to help users with:

* Export opportunity discovery
* Product-country market comparison
* Buyer and supplier lead discovery
* HS-code intelligence
* AI-powered trade reports
* Import and sourcing intelligence
* Trade documentation guidance
* Corridor-specific export-import insights
* Dashboard-based trade workflow management

---

## Research Alignment

TradeAI aligns with research areas including:

* Artificial intelligence for export market intelligence
* Buyer discovery and supplier matching
* Recommender systems for B2B trade
* Graph-based trade intelligence
* Predictive analytics for export opportunity ranking
* Explainable AI for business decision support
* Risk-aware buyer and market evaluation
* Digital trade platforms for MSMEs

The platform structure demonstrates how exporter requirements, product information, HS codes, target countries, buyer/supplier discovery, and AI-assisted reporting can be organized into a practical export-import intelligence workflow.

---

## Phase 1 Target Corridors

The Phase 1 scope focuses on selected high-potential trade corridors instead of covering all countries at once.

### India → East Africa

Target countries:

* Kenya
* Tanzania
* Uganda
* Rwanda

Focus areas:

* Export opportunity discovery
* Buyer and distributor discovery
* Product-country reports
* HS-code and document-readiness guidance
* MSME export support

### India → Gulf / GCC

Target countries:

* UAE
* Saudi Arabia
* Oman
* Qatar

Focus areas:

* Premium export market discovery
* Buyer and distributor discovery
* Re-export market intelligence
* Product-country scoring
* Trade-readiness guidance

### India ↔ China

Focus areas:

* Sourcing intelligence
* Import dependency analysis
* Supplier comparison
* Price benchmarking
* Product-category tracking
* Import opportunity evaluation

---

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* Static multipage interface

### Backend

* Node.js
* Express.js
* MongoDB
* JWT authentication
* REST API structure

### Planned / Optional Integrations

* AI model integration for trade report generation
* Trade-data APIs
* Cloud-based file uploads
* Payment and subscription workflow
* Admin analytics and review tools

---

## Project Structure

Important folders include:

```txt
pages/
css/
js/
backend/
docs/
assets/
```

### Folder Purpose

```txt
pages/      Static frontend pages and user-facing workflows
css/        Styling files
js/         Frontend JavaScript and API interaction logic
backend/   Express.js backend, models, routes, controllers, and services
docs/      Technical documentation and testing checklists
assets/    Images, logos, and static assets
```

---

## Core Pages

The current MVP includes the following main pages:

```txt
index.html
pages/register.html
pages/login.html
pages/pricing.html
pages/countries.html
pages/corridors.html
pages/export-opportunity-report.html
pages/contact.html
```

---

## Corridor Pages

The current corridor-specific pages include:

```txt
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

These pages are intended to support country-specific export-import intelligence, market positioning, and corridor-based user acquisition.

---

## Backend Modules

Current backend modules include:

* Authentication
* User registration and login
* Buyer management
* Product management
* Inquiry workflow
* Trade-data structure
* Copilot / AI-assistant structure
* Upload handling
* Admin structure
* Billing and payment scaffold
* Report request structure

---

## Current Prototype Status

TradeAI currently includes:

* Static frontend acquisition flow
* Target corridor pages
* Countries hub page
* Corridors strategy page
* Export opportunity report page
* Pricing page
* Register/login flow
* Contact and feedback flow
* Dashboard personalization structure
* Backend scaffold for core trade workflows
* Documentation for API testing and deployment preparation

The current prototype is focused on:

* Research demonstration
* MVP validation
* User-flow testing
* Trade-intelligence workflow design
* Stakeholder feedback
* Conversion-readiness assessment

Some features may use sample, demo, fallback, or staging data depending on the environment.

---

## Research Prototype Scope

This repository is a research prototype and MVP-stage implementation.

It is intended to demonstrate:

* Platform architecture
* Export-import workflow design
* AI-assisted trade-intelligence concept
* Buyer/supplier discovery flow
* Product-country comparison structure
* Report request and dashboard flow
* Backend service organization

It is not intended to claim that all features are fully production-ready.

Production-grade deployment would require additional work in:

* Data validation
* Real-time trade-data integration
* Security hardening
* Compliance verification
* Payment activation
* AI report automation
* Scalable cloud deployment
* User testing and business validation

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

From the project root, run:

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

Do not commit environment files.

Do not commit:

```txt
.env
backend/.env
```

Environment-specific values such as database URLs, JWT secrets, API keys, payment secrets, and cloud service credentials must stay outside source control.

Examples of sensitive values:

* `MONGO_URI`
* `JWT_SECRET`
* `OPENAI_API_KEY`
* `COMTRADE_API_KEY`
* `CLOUDINARY_API_SECRET`
* `RAZORPAY_KEY_SECRET`

Use `.env.example` files for safe placeholder values only.

---

## Documentation

Important project documentation exists in:

```txt
docs/
```

Useful files include:

```txt
docs/API_TEST_CHECKLIST.md
docs/TESTING_WORKFLOWS.md
docs/DEPLOYMENT_STAGING.md
docs/PRODUCTION_LAUNCH_CHECKLIST.md
```

These documents support API testing, staging deployment, workflow validation, and production-readiness planning.

---

## Deployment Status

Current deployment status may vary by branch and environment.

General status:

* Frontend: local/static prototype or staging preview
* Backend: local/staging implementation
* Database: MongoDB-based backend structure
* AI features: prototype or integration-ready structure
* Payment features: scaffolded for future production integration
* Secrets: private credentials and environment-specific values are excluded

This repository does not include real API keys, private credentials, production secrets, or user data.

---

## Code Availability for Research Use

This repository may be referenced as supplementary implementation material for academic or research work related to AI-driven export market intelligence and buyer discovery.

Recommended citation context:

```txt
The repository is provided as supplementary implementation material for demonstrating the proposed export-intelligence workflow and MVP-stage system architecture.
```

For research submission, it is recommended to cite a fixed GitHub release version rather than the general repository homepage.

Example release naming:

```txt
v1.0-irjet
```

Suggested release title:

```txt
IRJET Supplementary Research Prototype Release
```

---

## Planned Extensions

Future extensions include:

* Expanded trade-data API integration
* Advanced buyer-ranking models
* AI-generated export opportunity reports
* Admin analytics for report requests
* Country-specific compliance intelligence
* HS-code-based risk scoring
* Buyer and supplier verification workflows
* Payment and subscription workflow integration
* Production-grade authentication and authorization
* Improved dashboard analytics
* Scalable cloud deployment
* Export-import document checklist automation

---

## Safety and Security Notes

No secrets should be committed to this repository.

Do not commit:

* API keys
* MongoDB URIs
* JWT secrets
* Cloudinary secrets
* Razorpay secrets
* `.env`
* `backend/.env`
* `node_modules/`
* Private deployment settings
* User data
* Confidential business data

Before pushing to GitHub, always check:

```bash
git status
git diff --cached
```

Also verify that no sensitive values appear in committed files.

---

## Academic and Development Note

TradeAI is under active development as a research-aligned export-import intelligence prototype.

The current version should be evaluated as:

* A concept demonstration
* An MVP-stage system
* A technical architecture prototype
* A foundation for future AI-enabled trade-intelligence features

It should not be treated as a final production-grade commercial platform without further testing, security review, compliance validation, and deployment hardening.

---

## License

License information can be added based on the intended use of the repository.

For private or restricted academic use, keep the repository license controlled.

For open-source release, add an appropriate license such as MIT, Apache-2.0, or another license selected according to the project’s future commercial and academic goals.
