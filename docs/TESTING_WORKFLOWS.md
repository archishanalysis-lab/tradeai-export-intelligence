# TradeAI End-to-End Workflow Tests

Base URL: `http://localhost:5000`

Frontend preview: open `index.html` or run a local static server from the project root.

Use this document after `backend/.env` has `MONGO_URI` and `JWT_SECRET`, then run:

```bash
cd backend
npm run seed
npm run dev
```

## Workflow 1: Exporter Onboarding To Product Match

Goal: verify auth, workspace data, product creation, AI matching and analytics.

1. Register exporter
   - API: `POST /api/auth/register`
   - Expected: user object with JWT token.
   - Check: token stored in frontend after register/login.

2. Login exporter
   - API: `POST /api/auth/login`
   - Expected: token and role `exporter`.

3. Confirm session
   - API: `GET /api/auth/me`
   - Expected: current user without password.

4. Upload product
   - Frontend: `pages/product-upload.html`
   - API: `POST /api/products`
   - Expected: product saved, AI matches returned.

5. Check product table
   - Frontend: `pages/product-dashboard.html`
   - API: `GET /api/products`
   - Expected: new product appears.

6. Run AI buyer match
   - API: `GET /api/products/:id/matches`
   - Expected: buyer cards with weighted score and reasons.

7. Check product analytics
   - API: `GET /api/products/analytics/summary`
   - Expected: total product count and catalog value update.

Failure signals:
- product saved without auth
- matches empty despite seeded buyers
- product visible to wrong org
- analytics count does not change

## Workflow 2: Buyer Discovery To Inquiry

Goal: verify trade-data buyer discovery and inquiry lifecycle.

1. Discover buyers from trade records
   - API: `GET /api/trade-data/buyer-discovery?hsCode=0901&reporterCode=699`
   - Expected: demo or live buyer candidates.

2. Create inquiry for product
   - API: `POST /api/inquiries`
   - Expected: inquiry status `pending`.

3. Exporter inbox
   - Frontend: `pages/inquiry-dashboard.html`
   - API: `GET /api/inquiries`
   - Expected: inquiry appears.

4. Change status
   - API: `PUT /api/inquiries/:id/status`
   - Body: `{ "status": "accepted" }`
   - Expected: status changes.

5. Add negotiation message
   - API: `POST /api/inquiries/:id/messages`
   - Expected: message appended.

Failure signals:
- inquiry created for missing product
- exporter cannot see inquiry
- invalid status accepted
- another organization can update inquiry

## Workflow 3: Trade Analytics Intelligence

Goal: verify real/dummy trade data, analytics and insight generation.

1. Load HS analytics
   - Frontend: `pages/analytics-dashboard.html`
   - API: `GET /api/trade-data/hs-code-analytics?hsCode=0901&reporterCode=699`

2. Check analytics cards
   - Expected: total trade value, record count, top country.

3. Check insights
   - Expected: opportunity/trend cards.

4. Test missing `COMTRADE_API_KEY`
   - Expected: response uses demo fallback.

Failure signals:
- live-data failure crashes route
- insights missing
- frontend does not handle demo source

## Workflow 4: Copilot Recommendation

Goal: keep AI scope narrow and stable.

1. Ask recommendation question
   - Frontend: `pages/copilot.html`
   - API: `POST /api/copilot/ask`
   - Prompt: `Suggest top countries for exporting turmeric from India.`

2. Check response
   - Expected: answer, suggested actions, provider.

3. Check auth and org context
   - Expected: route requires token and includes user role/context internally.

4. Test no AI key
   - Expected: local provider fallback.

Failure signals:
- prompt not validated
- no auth required
- OpenAI error breaks route instead of fallback

## Workflow 5: File Upload

Goal: verify product image/catalog/certificate upload path.

1. Upload local file
   - API: `POST /api/uploads/product-image`
   - Form-data key: `file`
   - Expected with Cloudinary keys: hosted URL.
   - Expected without Cloudinary keys: local upload metadata.

2. Attach returned URL to product
   - API: `PUT /api/products/:id`
   - Body: `{ "imageUrl": "<uploaded-url>" }`

3. Check product dashboard
   - Expected: product still loads and image URL is stored.

Failure signals:
- unsupported file type accepted
- huge file accepted
- route crashes without Cloudinary env

## Workflow 6: Organization Boundary

Goal: prevent cross-tenant modification.

1. Login as exporter A and create product.
2. Login as exporter B from another organization.
3. Try `PUT /api/products/:id`.
4. Try `DELETE /api/products/:id`.
5. Repeat for buyers and inquiries.

Expected:
- same org can access shared org records
- different org gets `404` or `403`
- admin can access all

## Workflow 7: Staging Smoke Test

Run after deploying frontend/backend.

1. Open staging frontend.
2. Register user.
3. Login.
4. Create product.
5. Run AI matches.
6. Ask copilot prompt.
7. Upload product image.
8. Load analytics.

Environment checks:
- `FRONTEND_URL` matches deployed frontend.
- `MONGO_URI` points to MongoDB Atlas.
- `CORS` accepts frontend domain.
- `COMTRADE_API_KEY`, `OPENAI_API_KEY`, Cloudinary keys are configured if live features are required.
