# Landing Medval Venezuela

This repository is a working fork of
[`aaronx3011/medval-landing`](https://github.com/aaronx3011/medval-landing)
prepared for the Venezuela site. It carries the Medval Venezuela demo catalog and
its own deployment identifiers; Venezuela-specific production content and the
servers still need owner approval and setup.

## Provenance

- Created: 2026-10-27
- Local directory:
  `/Users/aaronx3011/Documents/personal/medval/landing-medval-venezuela`
- Source directory: `/Users/aaronx3011/Documents/personal/medval/medval-landing`
- Source branch: `fix/mobile-hero-framing`
- Source commit: `fa6f0062cfff932c2f04084801c4bdde9a3642e3`
- Working tree: the source's uncommitted changes were copied (37 files),
  including the admin dashboard and responsive work completed before
  2026-10-27.
- Local branch: `main`
- Git history: reset on 2026-10-27; fresh repository on `main`, with no commits.
- `origin`: `https://github.com/aaronx3011/medval-landing-venezuela.git`
- No `upstream` remote remains.

The copy excludes `node_modules/`, `.next/`, `media/`, `example/`, `.env`,
test reports and other generated artifacts. The source repository and its
working tree were not modified.

## Verification performed

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm build` (no database, no `.env`)

See the handoff summary for the results.

## Deployment identity

The fork no longer reuses the international site's `medval` identifiers. The
canonical Medval Venezuela identifiers are:

| Item | Value |
| --- | --- |
| Project / deployment name | Medval Venezuela |
| GitHub repository | `aaronx3011/medval-landing-venezuela` |
| GitHub Environments | `staging`, `production` |
| Remote directory on each server | `/srv/medval-ve` |
| Compose project name | `medval-ve` |
| App image | `medval-ve-web:<environment>-<sha>` |
| App container / nginx upstream | `medval-ve-web` (compat alias `medval-web-ve`) |
| MongoDB database | `medval_ve` |
| Compose default network | `medval-ve_default` |
| Self-hosted runner | `medval-ve-docker-runner` |

`deploy/deploy.sh`, `deploy/compose.yml`, `deploy/compose.production.yml`,
`deploy/README.md`, `AGENTS.md`, the local compose file and `.env.example` use
these values. The GitHub Environment variable names are unchanged:
`DEPLOY_HOST`, `DEPLOY_SSH_PORT`, `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_GA_ID`.

## Before this fork can deploy

1. Create and push the initial commit when requested. The new GitHub repository
   already exists and is configured as `origin`.
2. Create the GitHub `staging` and `production` environments and their four
   variables above.
3. Prepare each server's `/srv/medval-ve/.env` with its own `DATABASE_URI`
   (`medval_ve` database), `PAYLOAD_SECRET`, `BIND_IP`, `CSRF_ORIGINS` and
   domain. Never reuse the international site's secrets or database.
4. Point DNS/nginx at the new deployment, set the proxy upstream to
   `medval-ve-web:3000`, and create `/srv/medval-ve/media` with UID `1001`.
   Existing `medval` volumes are not reused: the new project name creates
   `medval-ve_mongo-data` on first start. If the same host still runs the old
   `medval` project, stop it before the first deploy: both projects bind
   `${BIND_IP}:3000` and would otherwise conflict.
5. Complete the separate coordinator and memory project registrations below.

## Project registration handoff

The owner created both registrations on 2026-10-27. The coordinator project is
visible, and the memory project resolves by name and repository URL. Memory
project ID: `bd590b17-a3c1-4f9d-b64c-a964a858eb4e`.

The memory directory alias still needs correction: it currently ends in
`medval-landing-venezuela`, but the actual workspace ends in
`landing-medval-venezuela`. Resolution by the actual workspace returns HTTP 404.

- Display name: `Landing Medval Venezuela`
- Coordinator slug: `medval-landing-venezuela`
- Kind: `code`
- Repository: `https://github.com/aaronx3011/medval-landing-venezuela`
- Workspace: `/Users/aaronx3011/Documents/personal/medval/landing-medval-venezuela`
- Memory aliases: the exact workspace path, `medval-landing-venezuela`,
  `landing-medval-venezuela`, and the repository URL ending in `.git`.

In the coordinator, confirm the Planning directory matches the workspace above.
In the memory system, add the exact workspace alias using an authorized
management session, then verify resolution by that path. A setup checkpoint has
been saved in the memory project.

Until those steps are done, treat this as source-compatible code with its own
deployment identity, not a deployable second site.

## Content still to be defined for Venezuela

The public pages currently mirror the international offering (`/es/int` and
`/en/int`). For a Venezuela site the owner must supply and approve:

- company name, address, phone, WhatsApp, email and opening/contact details;
- products, specialties, alliances, certifications and regulatory wording that
  are valid in Venezuela (do not copy claims from other markets);
- Spanish/English copy, SEO titles/descriptions, pricing/currency and analytics;
- media images with usage rights.

Do not invent country-specific claims or reuse another market's permits.
