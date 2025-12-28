# Inventory Management System (Next.js + Express + PostgreSQL)

This repo contains:

- `backend/`: ExpressJS REST API + PostgreSQL (via Prisma)
- `frontend/`: NextJS UI consuming the API

## Prerequisites (Windows)

- Install **Node.js LTS** (recommended 20+)
- Install **PostgreSQL 14+** and ensure you can run `psql`

## 1) Create the database

Create a database and user (adjust names/passwords):

```sql
CREATE USER ims_user WITH PASSWORD 'ims_password';
CREATE DATABASE ims OWNER ims_user;
GRANT ALL PRIVILEGES ON DATABASE ims TO ims_user;
```

## 2) Run the backend

```powershell
cd backend
Copy-Item .env.example .env
# Edit .env if your Postgres username/password/db name differs
npm install
npm run prisma:migrate
npm run dev
```

If `prisma:migrate` fails with authentication, update `DATABASE_URL` in `backend/.env` to match your local PostgreSQL credentials.

Backend runs at `http://localhost:4000`.

## 3) Run the frontend

```powershell
cd frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Deploying to Vercel (frontend)

- Deploy the frontend as a separate Vercel project with **Root Directory** set to `frontend`.
- Set `NEXT_PUBLIC_API_BASE_URL` in the Vercel frontend project to your backend base URL (example: `https://<backend>.vercel.app`).
- Ensure the backend allows the Vercel frontend origin via `FRONTEND_ORIGIN` (example: `https://<frontend>.vercel.app`).

## What this solves (assignment scope)

This implementation provides **inventory visibility** per SKU and two practical controls:

- **Low-stock visibility**: products whose `onHand` is below their `reorderLevel`.
- **Dead inventory visibility**: products that still have stock but **no movements in N days**.

Inventory is tracked via **stock movements** (IN / OUT / DAMAGED adjustments) so you can audit changes.
