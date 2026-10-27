# Git & GitHub workflow

How we manage branches, pull requests, releases and the history of this repo.
These practices were proven out while shipping WEB-07 → WEB-41; follow them
unless the owner says otherwise.

---

## Branches

| Kind | Name | Cut from |
| --- | --- | --- |
| One issue | `issue/WEB-XX-short-slug` | the branch it depends on, or `develop` |
| Correction | `fix/short-slug` | the most recent branch |
| Release | (no branch needed) | PR `develop` → `main` directly |

- **One branch per issue.** Never mix two issues in one branch.
- **Stacked branches**: when an issue depends on unfinished work, cut the branch
  from the previous issue's branch. Keep the dependency chain shallow.
- Keep branches short-lived; merge in stack order (below).

## Pull requests (into `develop`)

- **Target `develop`** for all product work. `develop` → `main` is a release.
- Title: the issue title (`WEB-XX · Short description`).
- Body: `Closes #NN`, a short summary, and an **Owner actions needed** list for
  anything the owner must do on servers or GitHub (env vars, settings).
- **Squash-merge** (`gh pr merge --squash`): one commit per PR keeps `develop`
  readable even when a branch contains review-fix commits.
- Merge only when `mergeStateStatus` is `CLEAN` (all checks green). The `checks`
  job name is load-bearing — branch protection requires it; never rename it.

## Releases (`develop` → `main`)

- Open one PR with a summary of the contained stories; **merging it triggers
  the staging deploy** (push to `main` → `deploy-staging` on the self-hosted
  runner). Nothing deploys from `develop` merges or PRs.
- **Squash-merged releases diverge `main` from `develop`.** On the next release,
  first merge `main` into `develop` and resolve conflicts by keeping
  **develop's side** (`git checkout --ours .` — develop is the newest superset),
  push, then open the release PR.

> Alternative: if you prefer zero conflict maintenance, use **merge commits**
> (not squash) for release PRs — `main` then stays an ancestor of `develop`
> and conflicts never appear. Pick one style and stay consistent; we currently
> squash-merge issue PRs and merge release PRs.

## Generated files

- `src/payload-types.ts` and `src/app/(payload)/admin/importMap.js` are
  **generated** (by `payload generate:types` and the dev server). They are
  **committed** — CI typechecks without a database — but **excluded from
  Prettier** via `.prettierignore` (the generator's formatting fights Prettier
  and `format:check` kept failing on merges).
- After changing collections/globals: run `pnpm generate:types`, then verify
  `git status` shows the regenerated file and commit it.

## Verification before opening a PR

1. `pnpm lint`, `pnpm format:check`, `pnpm typecheck` — all clean (zero
   warnings; fix or delete starter cruft rather than tolerating noise).
2. Focused vitest specs for what changed; the full int suite before releases.
3. **Live verification**: run the stack (`docker compose up -d`) and check the
   real pages with `curl` or Playwright screenshots.
4. For browser-specific reports: reproduce with a **fresh Playwright profile**
   (`firefox.launch()` / `chromium.launch()`) before blaming code — stale
   browser caches were the cause of several false reports.
5. When touching animations: test with `page.emulateMedia({ reducedMotion:
   'reduce' })` too.

## Known gotchas (learned the hard way)

- **zsh globbing**: quote every path containing parentheses — unquoted
  `src/app/(frontend)/...` throws "no matches found" and silently skips steps
  chained with `&&`, which caused repeated lost edits.
- **Port 3000 collisions**: several dev servers can share the port across
  IPv4/IPv6 (`127.0.0.1` vs `::1`) and serve different apps. Pin the address
  (`[::1]` for the Docker stack) and check `lsof -nP -i :3000`.
- **`sudo -S` over SSH**: the password prompt consumes stdin once; subsequent
  `sudo` in subshells/`$()` may silently fail. Run one `sudo sh -c '…'` per
  logical group or re-echo the password.
- **GitHub self-approval is impossible** — the PR author cannot approve their
  own PR. Merges ride on green checks.
- **Verify what you push, not what you edited**: confirm the fix is inside the
  pushed commit (`git show origin/branch:file`) — working-tree edits were lost
  more than once to branch switches and hard resets.

## Issues

- Tracked on GitHub Issues via `gh`; conventions in
  `docs/agents/issue-tracker.md`.
- PR bodies use `Closes #NN` — the issue closes when the commit reaches
  `main` (the release), not on the `develop` merge.
- Human/infrastructure-gated tickets stay open with their blockers listed.
