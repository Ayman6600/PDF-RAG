# OKF-RAG — Production-Grade PDF Retrieval-Augmented Generation Platform

A production-grade document intelligence platform that converts PDFs into structured **Open Knowledge Format (OKF)** knowledge, indexes the knowledge using hybrid retrieval (Vector + BM25 + Metadata + RRF + Reranking), and provides strictly grounded AI answers with page-level citations.

---

## 🏛 System Architecture

```text
                    ┌──────────────────────┐
                    │      Frontend        │
                    │ React + TypeScript   │
                    │ Vite / TailwindCSS   │
                    └──────────┬───────────┘
                               │
                               │ HTTPS / SSE Streaming
                               ▼
                    ┌──────────────────────┐
                    │     NestJS API       │
                    │                      │
                    │ Auth & RBAC          │
                    │ Documents & Storage  │
                    │ BullMQ Ingestion     │
                    │ Hybrid RAG Engine    │
                    │ Chat & SSE           │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
             ▼                 ▼                  ▼
       PostgreSQL 16        Object Storage      Redis 7
       + pgvector           PDF files           Queues &
       + tsvector           OKF bundles         Caching
             │
             ▼
      Retrieval Pipeline
             │
     ┌───────┼─────────┐
     ▼       ▼         ▼
  Vector   BM25      Metadata
  Search   Search     Filter
     │       │         │
     └───────┼─────────┘
             ▼
          Reranker
             │
             ▼
       Context Builder
             │
             ▼
      Pluggable LLM
             │
             ▼
       Grounded Answer + Page Citations
```

---

## 🚀 Key Features

* **Strict Monorepo & Separate Deployments**: Fully separated NestJS API backend and React Vite frontend.
* **OKF Knowledge Layer**: PDF documents are transformed into structured Open Knowledge Format bundles complete with YAML frontmatter metadata, table-of-contents indexing, and cross-section graphs.
* **Asynchronous Ingestion**: PDF parsing, OKF generation, chunking, and vector embedding execute asynchronously via BullMQ queues with Redis.
* **Hybrid Retrieval & Reranking**: Combines pgvector cosine similarity with PostgreSQL full-text `tsvector` keyword search using Reciprocal Rank Fusion (RRF `k=60`) and Cross-Encoder candidate reranking.
* **Page-Level Citation Tracking**: Every claim is cited with `[DocumentName — Page X]`. Clicking a citation link immediately opens the PDF viewer modal at the cited page.
* **SSE Real-Time Streaming**: Real-time token streaming endpoint (`/api/v1/conversations/:id/stream`) with event-driven progress feedback (`message_start`, `retrieval_result`, `token`, `citation`, `message_complete`).
* **Multi-Tenancy & Security**: Strict organization-scoped isolation, JWT authentication, Passport, Refresh Tokens, RBAC Roles (`ADMIN`, `USER`, `VIEWER`), Rate Limiting (Throttler), Helmet security headers, and prompt injection safeguards.
* **Enterprise CI/CD with Harness**: Complete Harness pipeline (`infrastructure/harness/pipeline.yaml`) with quality gates, automated unit & integration testing, container security scanning, and rolling releases.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS, TypeScript, Node.js, Express, Passport, JWT, BullMQ, Pino, Zod, Swagger OpenAPI |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Lucide Icons, TanStack Query, React Router |
| **Database** | PostgreSQL 16 + pgvector extension + `tsvector` full-text search, Prisma ORM |
| **Caching & Queues**| Redis 7, BullMQ |
| **AI Providers** | OpenAI (GPT-4o / Embeddings), Anthropic, Google Gemini (Pluggable Adapters) |
| **DevOps & CI/CD** | Docker, Docker Compose, Nginx, Harness CI/CD |

---

## 📋 Prerequisites

* **Node.js** `>= 18.0.0`
* **npm** `>= 10.0.0` or **pnpm** `>= 8.0.0`
* **Docker** & **Docker Compose**

---

## 🔧 Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key environment variables:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://okf_user:okf_password@localhost:5432/okf_rag?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=super-secret-jwt-key-production-change-me-32-chars
JWT_REFRESH_SECRET=super-secret-jwt-refresh-key-production-32-chars
LLM_PROVIDER=openai
LLM_API_KEY=your-openai-api-key
LLM_MODEL=gpt-4o-mini
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
```

---

## 💻 Local Development Commands

### 1. Start Infrastructure Services (PostgreSQL + pgvector & Redis)

```bash
npm run docker:up
```

### 2. Run Database Migrations & Seed Admin User

```bash
npm --filter backend run prisma:migrate
npm --filter backend run prisma:seed
```

Default seeded admin login:
* **Email**: `admin@acme.com`
* **Password**: `Admin123!`

### 3. Start Monorepo Development Servers (Backend + Frontend)

```bash
npm run dev
```

* **Frontend UI**: `http://localhost:5173`
* **Backend API**: `http://localhost:3000/api/v1`
* **Swagger Documentation**: `http://localhost:3000/api/docs`

---

## 🧪 Testing & RAG Evaluation

### Run Unit Tests

```bash
npm run test
```

### Run RAG Benchmark Evaluation

```bash
npm run eval
```

Evaluates retrieval precision, recall, citation accuracy, and answer faithfulness against reference evaluation datasets.

---

## 🐳 Production Docker Deployment

To build and run all services (Backend, Frontend, PostgreSQL + pgvector, Redis) using Docker Compose:

```bash
npm run docker:prod:up
```

Stop production stack:

```bash
npm run docker:prod:down
```

---

## 🚢 Harness CI/CD Pipeline

Declarative pipeline configurations are available in `infrastructure/harness/pipeline.yaml`.

### Pipeline Execution Workflow:

```text
Git Push
   ↓
Install & Lint
   ↓
TypeScript Compilation
   ↓
Unit & Integration Tests
   ↓
Build Multi-Stage Docker Images
   ↓
Security & Vulnerability Scanning
   ↓
Deploy Staging
   ↓
Automated Smoke Probes
   ↓
Manual Production Approval (DevOps Lead)
   ↓
Zero-Downtime Rolling Deployment to Production
   ↓
Health Verification Probes (/health/ready)
```

---

## 🛡 Security Checklist

- [x] Passwords hashed with `bcrypt` (salt rounds = 10)
- [x] JWT access tokens & refresh tokens rotated securely
- [x] Multi-tenancy isolation enforced on every query (`organizationId`)
- [x] PDF documents isolated as non-executable passive data frames
- [x] Strict zero-hallucination system prompt instructions
- [x] Helmet security headers & CORS policy configured
- [x] Rate limiting configured with `@nestjs/throttler` & Redis
- [x] Zero secrets exposed to frontend bundles
