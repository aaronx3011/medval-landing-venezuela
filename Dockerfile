FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are baked in at build time, so each environment gets its own image
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Self-contained seed bundle: runs in the runner image with the standalone node_modules.
# Only sharp/react/next/graphql stay external — they exist in the standalone output.
RUN pnpm exec esbuild src/seed/index.ts --bundle --platform=node --format=esm --outfile=seed.mjs \
  --external:sharp --external:react --external:react-dom --external:next --external:graphql \
  --loader:.css=empty --loader:.scss=empty --loader:.svg=empty \
  "--banner:js=import { createRequire as __seedCreateRequire } from 'module'; const require = __seedCreateRequire(import.meta.url);"

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/seed.mjs ./seed.mjs
COPY --from=builder --chown=nextjs:nodejs /app/seed-assets/catalog/*.jpg ./catalog-import/
RUN mkdir -p media && chown nextjs:nodejs media
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
