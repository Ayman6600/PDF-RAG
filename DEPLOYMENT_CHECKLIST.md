# Production Deployment Guide & Checklist

This document provides step-by-step procedures for deploying, maintaining, and rolling back the **OKF-RAG** platform in production on **Render** (as well as Railway/Docker/Vercel).

---

## 1. Architecture Overview

- **Monorepo Manager**: `pnpm` (v11.21.0) with Turborepo (`turbo 2.10.12`)
- **Backend API**: NestJS 10 on Node 20 LTS (`apps/backend`)
- **Frontend SPA**: React 18 + Vite 5 (`apps/frontend`)
- **Database**: PostgreSQL 16 with `pgvector` & `tsvector` extensions
- **Queues & Caching**: Redis 7 with BullMQ
- **Health Checks**: `/api/v1/health`, `/api/v1/health/ready`, `/api/v1/health/live`

---

## 2. Pre-Deployment Validation

Before triggering any deployment, run the unified verification check locally:

```bash
# 1. Deterministic dependency install
pnpm install --frozen-lockfile

# 2. Run all quality gates (Linting, Unit Tests, Production Builds)
pnpm run check
```

---

## 3. Render Deployment Options

### Option A: Automatic Blueprint Deployment (Recommended)

1. Navigate to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository (`PDF-RAG`).
4. Render will detect [`render.yaml`](./render.yaml) and automatically configure:
   - **`okf-rag-backend`** (Web Service via Docker)
   - **`okf-rag-frontend`** (Static Site with SPA routing)
5. Fill in the required secret environment variables (e.g. `DATABASE_URL`, `REDIS_URL`, `LLM_API_KEY`) in the Render Dashboard.
6. Click **Apply**.

---

### Option B: Manual Service Configuration

#### Backend Web Service
- **Name**: `okf-rag-backend`
- **Environment**: `Docker`
- **Dockerfile Path**: `apps/backend/Dockerfile`
- **Docker Context**: `.` (Root directory)
- **Health Check Path**: `/api/v1/health`
- **Port**: `3000` (Bound to `0.0.0.0`)

#### Frontend Static Site
- **Name**: `okf-rag-frontend`
- **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter @okf-rag/shared-types run build && pnpm --filter @okf-rag/frontend run build`
- **Publish Directory**: `apps/frontend/dist`
- **SPA Rewrites**: Route `/*` -> `/index.html`

---

## 4. Environment Variables Checklist

### Backend Environment Variables (`apps/backend`)

| Variable | Required | Description | Example / Recommended Value |
|---|---|---|---|
| `NODE_ENV` | Yes | Application environment | `production` |
| `PORT` | Yes | HTTP server port | `3000` (Render default) |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `REDIS_URL` | Yes | Redis connection string | `rediss://default:pass@host:6379` |
| `JWT_SECRET` | Yes | Secret key for JWT access tokens | 32+ char random string |
| `JWT_REFRESH_SECRET` | Yes | Secret key for refresh tokens | 32+ char random string |
| `JWT_EXPIRATION` | No | Access token expiration | `1h` (Default) |
| `JWT_REFRESH_EXPIRATION`| No | Refresh token expiration | `7d` (Default) |
| `CORS_ORIGIN` | Yes | Allowed frontend origin(s) | `https://okf-rag-frontend.onrender.com` |
| `STORAGE_PROVIDER` | No | File storage provider (`local` or `s3`) | `local` |
| `STORAGE_LOCAL_PATH` | No | Storage path for uploads | `./uploads` |
| `LLM_PROVIDER` | No | LLM service (`groq`, `openai`, etc.) | `groq` or `openai` |
| `LLM_API_KEY` | Yes | API key for configured LLM provider | `gsk_...` or `sk-...` |
| `LLM_MODEL` | No | Model name | `gpt-4o-mini` or `llama-3.1-70b-versatile` |
| `EMBEDDING_PROVIDER` | No | Embedding provider | `openai` |
| `EMBEDDING_MODEL` | No | Embedding model name | `text-embedding-3-small` |
| `EMBEDDING_DIMENSION` | No | Vector embedding dimensions | `1536` |

### Frontend Environment Variables (`apps/frontend`)

| Variable | Required | Description | Example / Recommended Value |
|---|---|---|---|
| `VITE_API_URL` | Yes | URL of deployed backend API | `https://okf-rag-backend.onrender.com` |
| `VITE_CLERK_PUBLISHABLE_KEY` | No | Optional Clerk key if using Clerk | `pk_test_...` |

---

## 5. Database Migration & Safety Guidelines

1. **Non-Destructive Deployments**:
   - Production schema updates should be deployed using:
     ```bash
     pnpm --filter @okf-rag/backend run prisma:deploy
     ```
   - Never run `prisma migrate reset` or `prisma db push --force-reset` in production.
2. **Extensions**:
   - Ensure the PostgreSQL database has the `vector` extension enabled (`CREATE EXTENSION IF NOT EXISTS vector;`).

---

## 6. Post-Deployment Smoke Test Checklist

After deployment completes, verify the following endpoints in sequence:

1. **Liveness & Health Check**:
   ```bash
   curl -i https://<backend-url>/api/v1/health
   # Expected: HTTP 200 {"status":"ok", ...}
   ```
2. **Database Readiness Probe**:
   ```bash
   curl -i https://<backend-url>/api/v1/health/ready
   # Expected: HTTP 200 {"status":"ready","database":"connected"}
   ```
3. **Swagger Documentation**:
   - Open `https://<backend-url>/api/docs` in browser.
4. **Frontend Homepage & Routing**:
   - Open `https://<frontend-url>` in browser.
   - Verify login screen loads and assets load without 404s.
5. **Authentication Flow**:
   - Log in using admin or test credentials.
   - Verify JWT access token is stored and authenticated requests include `Bearer <token>`.
6. **Upload & Ingestion Workflow**:
   - Upload a test PDF document.
   - Verify PDF processes through BullMQ queue and status changes from `PROCESSING` to `READY`.
7. **RAG Chat & Citations**:
   - Ask a question in the chat interface.
   - Verify response streams tokens and returns citation links.

---

## 7. Rollback Procedure

If a production deployment causes regressions or failures:

1. **Check Render Logs**:
   - Inspect the **Logs** tab on Render Dashboard for stack traces or startup errors.
2. **Instant Rollback via Dashboard**:
   - In Render Dashboard, open the service > **Deploys**.
   - Find the previous known-good deployment commit and click **Rollback to this deploy**.
3. **Investigate & Reproduce Locally**:
   ```bash
   git checkout <broken-commit>
   pnpm run check
   ```
4. **Fix & Redeploy**:
   - Commit and push fix to `main`.
   - Render will automatically trigger a clean build and deploy.
