# Harness CI/CD Configuration for OKF-RAG

This directory contains declarative pipeline definitions for Harness CI/CD.

## Pipeline Architecture

The pipeline consists of 3 main stages:

1. **Build and Test (CI)**
   - Installs dependencies using `pnpm`.
   - Runs linting and strict TypeScript compilation checks across `apps/backend` and `apps/frontend`.
   - Executes unit & integration tests (`pnpm test`).
   - Builds multi-stage Docker images for backend and frontend.
   - Pushes built images tagged with build sequence ID and `latest`.

2. **Deploy to Staging**
   - Performs a Kubernetes rolling deployment to the `staging` environment.
   - Runs automated health check probes against `/api/v1/health/ready`.

3. **Production Approval & Release**
   - Enforces a mandatory Harness Manual Approval step (`devops_lead` user group).
   - Performs zero-downtime rolling deployment to `production`.
   - Verifies post-deployment cluster health.

## Environment Variables & Harness Secrets

Ensure the following secrets are configured in the Harness Secret Manager:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `LLM_API_KEY`
- `DOCKER_REGISTRY_TOKEN`
