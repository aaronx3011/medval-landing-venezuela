# AGENTS.md — CI/CD instructions for coding agents

This file tells coding agents what to build for CI/CD in the `medval-landing-venezuela` repo, and where their job ends. The human owner handles everything outside the repo; their steps are in `OWNER.md`.

Related backlog stories: **WEB-01** (local stack), **WEB-02** (lint, format, type checks), **WEB-03/04** (staging and production), **WEB-06** (repeatable deploys), **WEB-49** (seed never in production).

---

## Infrastructure (for context only)

| Server     | Network                                     | Role                                                          |
| ---------- | ------------------------------------------- | ------------------------------------------------------------- |
| Edge       | Public + WireGuard                          | nginx (HTTPS for staging, basic auth) + WireGuard             |
| Runner     | `10.8.0.6` (WireGuard)                      | GitHub Actions self-hosted runner; builds images              |
| Staging    | `10.8.0.8` (WireGuard)                      | Staging app + Mongo; reached by the edge nginx over WireGuard |
| Production | Public internet only (**not** on WireGuard) | Production app + Mongo; runs its own nginx with certificates  |

A deploy works like this:

1. The runner builds the image with the environment's public build values.
2. It streams the image to the target server over SSH (`docker save | ssh … docker load`). No registry is used. Staging is reached over WireGuard; production over the public internet.
3. It copies `deploy/compose.yml` to the target and runs `docker compose up -d --wait` there.

The target server is chosen by the GitHub Environment (`staging` or `production`) through its variables.

**Deployment identity — Medval Venezuela:** remote directory `/srv/medval-ve`,
Compose project `medval-ve`, app image/container and nginx upstream
`medval-ve-web`, MongoDB database `medval_ve`, default network
`medval-ve_default`. Do not reuse the international site's `medval` names,
paths, volumes or database.

---

## Your scope

**You may create and change:**

- Anything inside this repository: app code, config, `Dockerfile`, `.dockerignore`, `deploy/`, `.github/workflows/`, `package.json` scripts.

**You must not touch (owner only):**

- Anything on the servers: `/srv/medval-ve/*`, nginx, firewalls, WireGuard, the runner and its compose project, SSH keys.
- Secrets and `.env` files with real values. Never create, commit or print them.
- GitHub settings: environments, environment variables, required reviewers, branch protection.
- DNS, domains, email sending domains, GA4 properties.

**Stop and ask the owner before:**

- Renaming the `checks` job in `ci.yml`. Branch protection requires that exact name.
- Changing `runs-on` labels (`[self-hosted, docker]`) or environment names (`staging`, `production`).
- Renaming or adding GitHub Environment variables (`DEPLOY_HOST`, `DEPLOY_SSH_PORT`, `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_GA_ID`). The owner must create them in GitHub first.
- Changing the remote path (`/srv/medval-ve`), the SSH user (`deploy`) or the compose project name (`medval-ve`) in `deploy/deploy.sh`.
- Changing port publishing in `deploy/compose.yml`. The app port must stay bound to `${BIND_IP}`, never `0.0.0.0`: that's the WireGuard IP on staging and `127.0.0.1` on production, where the app would otherwise be open to the internet. Mongo must never have `ports:`.
- Adding a new environment variable the app needs at runtime. The owner must add it to each server's `.env` first; list it in your PR description.

---

## Task 1 — Scaffold (if the repo is still empty)

1. Scaffold with `pnpm dlx create-payload-app@latest` using the **blank** template and **MongoDB**. Put the files at the repo root.
2. Pin pnpm: `corepack use pnpm@latest` (writes `packageManager` to `package.json`). Commit `pnpm-lock.yaml`.
3. Add scripts to `package.json`:

   ```json
   "scripts": {
     "lint": "eslint .",
     "format": "prettier --write .",
     "format:check": "prettier --check .",
     "typecheck": "tsc --noEmit"
   }
   ```

4. Standalone output in `next.config.mjs`:

   ```js
   const nextConfig = { output: 'standalone' }
   export default withPayload(nextConfig)
   ```

5. Media uploads in a fixed folder:

   ```ts
   upload: { staticDir: process.env.MEDIA_DIR || 'media', /* sizes… */ }
   ```

6. Do **not** set `serverURL` in the Payload config (media URLs stay relative). Leave a `csrf` entry reading from `NEXT_PUBLIC_SERVER_URL`.

### Rules that keep the pipeline green

- **Commit `payload-types.ts`.** CI runs `tsc` without a database. Regenerate it whenever collections or globals change.
- **The build must not need MongoDB or secrets.** The image is built on the runner, which has no database and no `.env`. CMS-driven routes render dynamically; do not pre-render pages that query Payload at build time.
- `NEXT_PUBLIC_*` values are baked in at build time and come from GitHub Environment variables. Only `NEXT_PUBLIC_SERVER_URL` and `NEXT_PUBLIC_GA_ID` are passed. If you need another, update the `Dockerfile`, `deploy/deploy.sh` and both workflows, and ask the owner to create the variable.
- The seed script (WEB-49) must refuse to run when `NODE_ENV=production`. `deploy.sh` must never call it.

---

## Task 2 — Files to create

```
Dockerfile
.dockerignore
deploy/compose.yml
deploy/deploy.sh          # must be executable: chmod +x
.github/workflows/ci.yml
.github/workflows/deploy-production.yml
```

### `Dockerfile`

```dockerfile
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml ./
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

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN mkdir -p media && chown nextjs:nodejs media
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

The app runs as UID **1001**; the owner sets the servers' `media/` folders to that owner. Don't change the UID without telling them.

### `.dockerignore`

```
node_modules
.next
media
.env*
.git
```

### `deploy/compose.yml`

Runtime stack for one server. `deploy.sh` copies it to `/srv/medval-ve/compose.yml` on the target on every deploy. `BIND_IP` comes from the target's `/srv/medval-ve/.env`.

```yaml
services:
  web:
    image: ${IMAGE:?IMAGE not set}
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_URI: mongodb://mongo:27017/medval_ve?replicaSet=rs0
      MEDIA_DIR: /app/media
    ports:
      # Staging: WireGuard IP (reached by the edge nginx). Production: 127.0.0.1 (reached by its local nginx).
      - '${BIND_IP:?BIND_IP not set in .env}:3000:3000'
    volumes:
      - ./media:/app/media
    depends_on:
      mongo:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'wget', '-qO-', 'http://127.0.0.1:3000/']
      interval: 10s
      timeout: 5s
      retries: 12
      start_period: 20s

  mongo:
    image: mongo:8
    restart: unless-stopped
    command: ['--replSet', 'rs0', '--bind_ip_all', '--wiredTigerCacheSizeGB', '0.25']
    volumes:
      - mongo-data:/data/db
    # Also initializes the single-node replica set on first start
    healthcheck:
      test:
        [
          'CMD-SHELL',
          'mongosh --quiet --eval "try { rs.status().ok } catch (e) { rs.initiate({_id:''rs0'',members:[{_id:0,host:''mongo:27017''}]}).ok }"',
        ]
      interval: 5s
      timeout: 10s
      retries: 20
      start_period: 10s

volumes:
  mongo-data:
```

### `deploy/deploy.sh`

Runs on the runner. Inputs come from the workflow's environment variables.

```bash
#!/usr/bin/env bash
set -euo pipefail

ENV="${1:?usage: deploy.sh staging|production}"
: "${DEPLOY_HOST:?DEPLOY_HOST not set (GitHub environment variable)}"
: "${NEXT_PUBLIC_SERVER_URL:?NEXT_PUBLIC_SERVER_URL not set (GitHub environment variable)}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
REMOTE_DIR="/srv/medval-ve"
SHA="${GITHUB_SHA:-$(git rev-parse HEAD)}"
IMAGE="medval-ve-web:$ENV-${SHA:0:12}"
SSH=(ssh -o BatchMode=yes -o ConnectTimeout=15 -p "$DEPLOY_SSH_PORT" "$DEPLOY_USER@$DEPLOY_HOST")

echo "Checking $ENV server ($DEPLOY_HOST)"
"${SSH[@]}" "test -f $REMOTE_DIR/.env" \
  || { echo "Missing $REMOTE_DIR/.env on $DEPLOY_HOST"; exit 1; }

echo "Building $IMAGE"
docker build --network host \
  --build-arg NEXT_PUBLIC_SERVER_URL="$NEXT_PUBLIC_SERVER_URL" \
  --build-arg NEXT_PUBLIC_GA_ID="${NEXT_PUBLIC_GA_ID:-}" \
  -t "$IMAGE" .

echo "Sending image to $DEPLOY_HOST"
docker save "$IMAGE" | gzip | "${SSH[@]}" "gunzip | docker load"

"${SSH[@]}" "cat > $REMOTE_DIR/compose.yml" < deploy/compose.yml

echo "Starting $IMAGE on $DEPLOY_HOST"
"${SSH[@]}" "cd $REMOTE_DIR && IMAGE='$IMAGE' docker compose -p medval-ve up -d --wait --remove-orphans"

# Keep the 5 most recent images on the target (for rollbacks) and 2 per environment on the runner
"${SSH[@]}" "docker images medval-ve-web --format '{{.Tag}}' | tail -n +6 | xargs -r -I{} docker rmi medval-ve-web:{} || true"
docker images medval-ve-web --format '{{.Tag}}' | grep "^$ENV-" | tail -n +3 \
  | xargs -r -I{} docker rmi "medval-ve-web:{}" || true

echo "Deployed $IMAGE to $ENV ($DEPLOY_HOST)"
```

`--network host` on the build is intentional: the runner server has trouble with HTTPS from Docker's bridge network. Keep it.

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4 # uses the version in "packageManager"
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm typecheck

  deploy-staging:
    needs: checks
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: [self-hosted, docker]
    environment: staging
    concurrency:
      group: deploy-staging
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@v4
      - run: ./deploy/deploy.sh staging
        env:
          DEPLOY_HOST: ${{ vars.DEPLOY_HOST }}
          DEPLOY_SSH_PORT: ${{ vars.DEPLOY_SSH_PORT }}
          NEXT_PUBLIC_SERVER_URL: ${{ vars.NEXT_PUBLIC_SERVER_URL }}
          NEXT_PUBLIC_GA_ID: ${{ vars.NEXT_PUBLIC_GA_ID }}
```

Never run jobs triggered by `pull_request` on the self-hosted runner. It has Docker socket access and SSH access to both servers.

### `.github/workflows/deploy-production.yml`

```yaml
name: Deploy production

on:
  workflow_dispatch: # pick a branch or tag in the "Run workflow" menu

concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: [self-hosted, docker]
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: ./deploy/deploy.sh production
        env:
          DEPLOY_HOST: ${{ vars.DEPLOY_HOST }}
          DEPLOY_SSH_PORT: ${{ vars.DEPLOY_SSH_PORT }}
          NEXT_PUBLIC_SERVER_URL: ${{ vars.NEXT_PUBLIC_SERVER_URL }}
          NEXT_PUBLIC_GA_ID: ${{ vars.NEXT_PUBLIC_GA_ID }}
```

---

## Before opening a PR

- [ ] `pnpm lint`, `pnpm format:check` and `pnpm typecheck` pass locally.
- [ ] `docker build .` succeeds **without** a database, secrets or `.env` present.
- [ ] `deploy/deploy.sh` is executable (`git ls-files -s deploy/deploy.sh` shows `100755`).
- [ ] No secrets, `.env` files, SSH keys or `media/` contents are committed.
- [ ] PR description lists any new env vars, build args, GitHub variables or owner actions needed.

## Handoff to the owner

When these files are merged, tell the owner the repo side is ready. They then follow `OWNER.md` (server setup, SSH access for the runner, nginx on the edge and production servers, GitHub environments and branch protection) before the first deploy can succeed.

---

## Agent skills

### Git & GitHub workflow

Branch naming (`issue/WEB-XX-slug`, `fix/…`), PR and squash-merge policy, release cadence (`develop` → `main`), generated-file rules and known gotchas. **Follow it for every change.** See `docs/agents/git-github-workflow.md`.

### Issue tracker

Issues live in GitHub Issues on `aaronx3011/medval-landing`, operated via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
