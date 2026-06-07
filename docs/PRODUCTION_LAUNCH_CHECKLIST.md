# TradeAI Production Launch Checklist

## 1. GitHub

- Confirm ignored files:
  - `node_modules/`
  - `backend/node_modules/`
  - `.env`
  - `backend/.env`
- Keep committed:
  - `.env.example`
  - `backend/.env.example`
  - `render.yaml`
  - `vercel.json`
- Add a GitHub remote:
  ```bash
  git remote add origin https://github.com/<your-user>/<your-repo>.git
  ```
- Push:
  ```bash
  git add .
  git commit -m "Prepare TradeAI production staging"
  git push -u origin main
  ```

## 2. Render Backend

- Create a Render Blueprint from `render.yaml`, or create a web service from `backend/`.
- Required environment variables:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `FRONTEND_URL`
  - `OPENAI_API_KEY`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Optional:
  - `COMTRADE_API_KEY`
  - `OPENAI_MODEL`
- Expected backend URL:
  - `https://tradeai-backend.onrender.com`

## 3. Vercel Frontend

- Import the GitHub repository into Vercel.
- Deploy the static frontend from the repo root.
- `js/api.js` uses:
  - local backend on localhost
  - `https://tradeai-backend.onrender.com/api` in production
- If Render gives a different backend URL, update `js/api.js` before deployment.

## 4. Live Production Flow Test

- Register
- Login
- Product upload with image
- Buyer discovery
- Inquiry creation/status update
- Copilot recommendation
- Analytics dashboard
- Admin overview
- Admin user suspension
- Admin buyer verification
- Admin product approval

## 5. Security Checks

- Helmet response headers enabled.
- Stricter CORS enabled through `FRONTEND_URL`.
- API rate limiting enabled.
- Mongo sanitization enabled.
- File upload type and size limits enabled.
- Suspended accounts blocked from login and token reuse.
