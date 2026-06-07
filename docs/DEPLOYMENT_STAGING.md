# TradeAI Staging Deployment

Recommended staging stack:

| Layer | Platform |
| --- | --- |
| Frontend | Vercel |
| Backend | Render or Railway |
| Database | MongoDB Atlas |
| Images | Cloudinary |
| Redis | Upstash |

## 1. MongoDB Atlas

1. Create an Atlas cluster.
2. Create a database user.
3. Allow Render/Railway network access.
4. Copy the connection string into `MONGO_URI`.

## 2. Backend On Render

Use `render.yaml` from repo root.

Required env vars:

```txt
MONGO_URI=
JWT_SECRET=
FRONTEND_URL=https://your-vercel-app.vercel.app
COMTRADE_API_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

After deploy, test:

```txt
GET https://your-render-app.onrender.com/
POST https://your-render-app.onrender.com/api/auth/login
```

## 3. Frontend On Vercel

Set frontend API URL before deploy by adding this snippet before page scripts when needed:

```html
<script>
  window.TRADEAI_API_URL = "https://your-render-app.onrender.com/api";
</script>
```

Current static deployment is configured in `vercel.json`.

## 4. Cloudinary

Add keys to backend env. Upload routes:

```txt
POST /api/uploads/product-image
POST /api/uploads/certificates
POST /api/uploads/catalogs
POST /api/uploads/invoices
```

If Cloudinary is not configured, uploads fall back to local `/uploads`.

## 5. Upstash Redis

Not wired as production BullMQ yet. Add later:

```bash
npm install bullmq ioredis
```

Then replace `queueService.js` memory queue with Redis-backed jobs.

## 6. Staging Smoke Test

Run the checklist in:

- `docs/API_TEST_CHECKLIST.md`
- `docs/TESTING_WORKFLOWS.md`

Minimum smoke flow:

1. Register exporter.
2. Create product.
3. Run product matches.
4. Upload product image.
5. Create inquiry.
6. Change inquiry status.
7. Run HS analytics.
8. Ask Copilot recommendation.
