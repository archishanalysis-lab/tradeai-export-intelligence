# TradeAI API Test Checklist

Base URL: `http://localhost:5000`

Use `Authorization: Bearer <token>` for all protected routes after login.

## Auth

- [ ] `POST /api/auth/register`
  - Body:
    ```json
    {
      "name": "Demo Exporter",
      "email": "<set local test email>",
      "company": "TradeAI Exports",
      "role": "exporter",
      "password": "<set local test password, do not commit>"
    }
    ```
  - Expect: `201`, user object, `token`.

- [ ] `POST /api/auth/login`
  - Body:
    ```json
    {
      "email": "<set local test email>",
      "password": "<set local test password, do not commit>"
    }
    ```
  - Expect: `200`, user object, `token`.

- [ ] `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Expect: `200`, current user without password.

## Buyer

- [ ] `POST /api/buyers`
- [ ] `GET /api/buyers?search=coffee&page=1&limit=8`
- [ ] `GET /api/buyers/:id`
- [ ] `PUT /api/buyers/:id`
- [ ] `DELETE /api/buyers/:id`

Buyer body:
```json
{
  "companyName": "UAE Retail Imports",
  "country": "UAE",
  "industry": "Food and beverage",
  "products": ["coffee", "tea"],
  "website": "https://example.com",
  "contactEmail": "buyer@example.com",
  "phone": "+971500000000",
  "verified": true,
  "tradeVolume": 1200000
}
```

## Product

- [ ] `POST /api/products`
- [ ] `GET /api/products?search=coffee&sort=-createdAt`
- [ ] `GET /api/products/:id`
- [ ] `PUT /api/products/:id`
- [ ] `DELETE /api/products/:id`
- [ ] `GET /api/products/:id/matches`
- [ ] `GET /api/products/analytics/summary`

Product body:
```json
{
  "name": "Organic Coffee Beans",
  "category": "Food and beverage",
  "hsCode": "0901",
  "moq": 500,
  "priceAmount": 4.5,
  "currency": "USD",
  "exportCountry": "India",
  "targetCountries": ["UAE", "Germany", "USA"],
  "tags": ["coffee", "arabica", "organic"],
  "availability": "available",
  "imageUrl": "https://example.com/coffee.jpg"
}
```

## Inquiry

- [ ] `POST /api/inquiries`
- [ ] `GET /api/inquiries`
- [ ] `GET /api/inquiries/:id`
- [ ] `PUT /api/inquiries/:id/status`
- [ ] `PATCH /api/inquiries/:id/status`
- [ ] `POST /api/inquiries/:id/messages`

Inquiry body:
```json
{
  "product": "<productId>",
  "buyerName": "Aisha Khan",
  "buyerEmail": "aisha@example.com",
  "companyName": "Gulf Retail Imports",
  "message": "Please quote 2 tons for Dubai delivery."
}
```

Status body:
```json
{
  "status": "accepted"
}
```

## Trade Data

- [ ] `GET /api/trade-data/records?hsCode=0901&reporterCode=699`
- [ ] `GET /api/trade-data/hs-code-analytics?hsCode=0901&reporterCode=699`
- [ ] `GET /api/trade-data/buyer-discovery?hsCode=0901&reporterCode=699`

If `COMTRADE_API_KEY` is not set, expect demo records with `source: "demo"`.

## Copilot

- [ ] `POST /api/copilot/ask`
  - Body:
    ```json
    {
      "prompt": "Find textile buyers in Germany",
      "filters": {
        "country": "Germany",
        "industry": "Textiles"
      }
    }
    ```
  - Expect: `200`, answer, suggested actions, provider.

## Uploads

Use `multipart/form-data` with field name `file`.

- [ ] `POST /api/uploads/product-image`
- [ ] `POST /api/uploads/certificates`
- [ ] `POST /api/uploads/catalogs`
- [ ] `POST /api/uploads/invoices`

Expect: `201`, uploaded asset URL, `documentType`, storage provider (`cloudinary` when configured, otherwise `local`).

## Admin

Use an admin token.

- [ ] `GET /api/admin/overview`
- [ ] `GET /api/admin/users`
- [ ] `PATCH /api/admin/users/:id/status`
- [ ] `GET /api/admin/buyers`
- [ ] `PATCH /api/admin/buyers/:id/verify`
- [ ] `GET /api/admin/products`
- [ ] `PATCH /api/admin/products/:id/approval`
- [ ] `GET /api/admin/inquiries`

User status body:
```json
{
  "status": "suspended"
}
```

Product approval body:
```json
{
  "approvalStatus": "approved"
}
```

## Company Profile

- [ ] `GET /api/profile/me`
- [ ] `PUT /api/profile/me`

Profile body:
```json
{
  "companyName": "TradeAI Exports",
  "contactPerson": "Demo Exporter",
  "businessType": "Exporter",
  "country": "India",
  "city": "Mumbai",
  "phone": "+919999999999",
  "exportCategories": "textiles, spices",
  "targetMarkets": "USA, UAE, Germany",
  "about": "Exporter of quality products."
}
```

## Saved Profiles

- [ ] `GET /api/saved-items`
- [ ] `POST /api/saved-items/buyers`
- [ ] `DELETE /api/saved-items/:id`

Save buyer body:
```json
{
  "buyer": "<buyerId>"
}
```

## Billing Scaffold

- [ ] `GET /api/billing/status`
- [ ] `POST /api/billing/checkout`

Checkout body:
```json
{
  "plan": "premium_exporter"
}
```

If Razorpay keys are not configured, checkout should return `501` with a clear setup message.

## Negative Tests

- [ ] Missing token returns `401`.
- [ ] Non-admin token returns `403` on `/api/admin/*`.
- [ ] Invalid ObjectId returns `400`.
- [ ] Invalid product body returns `400`.
- [ ] Invalid inquiry status returns `400`.
- [ ] User from another organization cannot update/delete records.
