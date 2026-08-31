FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy repository manifests and lockfiles
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY packages ./packages
COPY apps/backend ./apps/backend
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @okf-rag/shared-types run build
RUN pnpm --filter @okf-rag/backend run prisma:generate
RUN pnpm --filter @okf-rag/backend run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_PATH=/app/node_modules:/app/apps/backend/node_modules

# Copy workspace roots and packages
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Copy backend application, dependencies, and build artifacts
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

# Ensure upload directory exists with proper permissions
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["sh", "-c", "if [ -f apps/backend/dist/src/main.js ]; then node apps/backend/dist/src/main.js; else node apps/backend/dist/main.js; fi"]

