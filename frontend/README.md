# Frontend (Next.js) — Deploy to Vercel

This folder contains the **Next.js** frontend.

## Local development

```powershell
cd frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

By default the frontend expects the backend at `http://localhost:4000`.

## Deploy to Vercel (monorepo)

### 1) Deploy (Vercel Dashboard)

1. Push your code to GitHub (this repo).
2. Go to https://vercel.com/new
3. **Import** the GitHub repository.
4. In **Project Settings** during import:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: (leave default)
5. Add environment variable(s):
   - `NEXT_PUBLIC_API_BASE_URL` = your deployed backend base URL
     - Example: `https://<your-backend-project>.vercel.app`
6. Click **Deploy**.

### 2) Fix backend CORS (required for browser calls)

Your backend uses `FRONTEND_ORIGIN` to control CORS.

On the **backend** deployment (wherever it is hosted), set:

- `FRONTEND_ORIGIN` = `https://<your-frontend-project>.vercel.app`

Then redeploy the backend.

### 3) Verify

- Open the deployed frontend URL
- Load the Products page and confirm it fetches data

## Notes

- If you use Preview Deployments, the frontend URL changes per preview. For the simplest setup, keep `FRONTEND_ORIGIN` unset on the backend (allows all origins) or update it when you promote to Production.
