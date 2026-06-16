# TradeAI Investor Demo Checklist

TradeAI is an MVP under active development. Some intelligence may be demo/sample coverage, and Render free-tier hosting can sleep after inactivity.

## Live URLs

- Frontend: https://tradeai-export-intelligence.vercel.app
- Backend health: https://tradeai-export-intelligence-1.onrender.com/health

## 30 Minutes Before Demo

1. Open the frontend Vercel URL.
2. Open the backend `/health` URL in a browser tab.
3. Confirm the health response shows `"status": "ok"`.
4. Log in with the prepared demo account.
5. Generate one export report.
6. Open Dashboard -> My Reports and confirm the report is visible.
7. Ask Copilot one practical trade question.
8. Keep the backend `/health` tab open during the demo if using Render free tier.

## Golden Path

1. Register or log in.
2. Open Dashboard.
3. Choose a product/HS code and country.
4. Generate an export opportunity report.
5. Open My Reports.
6. View, download, or delete a saved report.
7. Ask Copilot a related follow-up question.

## Demo Account Setup

Run the existing seed script against the intended demo database only:

```bash
cd backend
npm run seed:demo
```

Prepared demo login values must be set locally or in a safe environment manager before running the seed. Do not commit real demo passwords.

- `DEMO_EXPORTER_EMAIL=<set locally>`
- `DEMO_EXPORTER_PASSWORD=<set locally, do not commit>`

The seed creates a demo organization, demo exporter user, sample buyers/products/corridor intelligence, two saved reports and two Copilot history messages. Demo records are marked with `isDemo: true` where the model supports it and should not be presented as verified live trade data.

## Backend Cold-Start Fallback

If the first backend request is slow:

1. Say: "The API is waking from free-tier hosting; this can take under a minute."
2. Wait for the frontend message: "Connecting to TradeAI server..."
3. Refresh only if the page shows "Server is temporarily unavailable."
4. Open the backend health URL directly to wake the service.
5. Continue with the dashboard once `/health` returns JSON.

## Pitch Week Uptime Recommendation

Do not add external cron setup to the codebase. For pitch week only, use an external uptime monitor such as cron-job.org.

- Target URL: `https://tradeai-export-intelligence-1.onrender.com/health`
- Method: `GET`
- Frequency: every 10 minutes
- Duration: only during demo/pitch week

Alternative: temporarily upgrade Render for pitch week to avoid free-tier sleep.

## Backup Plan

Keep a short screen recording ready showing:

1. Login.
2. Dashboard.
3. Generate report.
4. My Reports.
5. Copilot answer.

Use the recording only if the backend provider is unavailable during the live demo.
