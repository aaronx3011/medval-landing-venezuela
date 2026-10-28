# Website Build — Technical Plan & Backlog

A 5-section marketing site with custom design and heavy animation, four regions in Spanish and English, and a Spanish admin dashboard where the client edits texts and images.

The current language/region model is documented in [GLOSSARY.md](GLOSSARY.md) and [the architecture decisions](docs/adr/0002-two-language-masters-plus-region-table.md). It supersedes the original country-locale wording in the backlog below.

Everything is built against **placeholder content first**. The client's real content is loaded in the last phase (**E9**).

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Animation stack](#animation-stack)
- [Environment rules](#environment-rules)
- [Getting started](#getting-started)
- [Content model](#content-model)
- [Backlog](#backlog)
- [Sprint plan](#sprint-plan)
- [Client content intake](#client-content-intake)
- [Definition of done](#definition-of-done)
- [Technical risks](#technical-risks)

---

## Features

| Area | What we build |
| --- | --- |
| Structure | 5 sections (names pending from the client; Home, Services, About, Gallery, Contact as working names) |
| Design | Custom visual direction from the client's brand guide, high-impact home, custom typography and composition |
| Motion | Animated logo loader, advanced animations, elaborate scroll effects, custom transitions between sections, interactive elements |
| Content | Dynamic galleries; different content per country (3 countries + international) |
| Conversion | WhatsApp buttons, social links, contact form, quote request form |
| Platform | Fully responsive (phone, tablet, desktop), basic SEO, Google Analytics |
| Admin | Dashboard to change basic texts and images |

---

## Tech stack

One Next.js app with Payload CMS embedded, backed by MongoDB, all running in Docker Compose on a single VPS. The site and the admin (`/admin`) are one project, one deploy and one database.

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript | Server Components read content through Payload's Local API |
| CMS / admin | Payload CMS 3 | Admin in Spanish, friendly labels and help text, live preview, drafts |
| Database | MongoDB, single-node replica set | Replica set needed for transactions; cache capped so Next.js has memory; port never exposed publicly |
| Media | Local `media/` volume on the VPS | Image sizes generated with sharp on upload |
| Regional content | Payload localization by language (`es`/`en`) + a Regions collection (`int`/`ve`/`us`/`co`) | Shared marketing copy per language; regional contact and SEO values editable in both languages |
| Reverse proxy | Caddy | Automatic HTTPS |
| Email | Transactional email adapter (Resend or SES) | Form notifications to the right country inbox |
| Analytics | Google Analytics 4 | Page views + conversion events |
| Package manager | pnpm, pinned via `packageManager` | Lockfile committed |

## Animation stack

Each library has one job, so they never fight over the same element.

| Library | Used for |
| --- | --- |
| Motion (formerly Framer Motion) | Logo loader, component enter/exit, hover and tap states, section transitions |
| GSAP + ScrollTrigger | Complex scroll timelines: pinning, scrubbing, parallax on Home and Gallery |
| Lenis | Smooth scroll, synced with ScrollTrigger; off when `prefers-reduced-motion` is set |

GSAP runs through `useGSAP` so animations clean up on unmount, and it is loaded only on sections that use it.

## Environment rules

- `NEXT_PUBLIC_SERVER_URL` must match the real public origin in each environment, or admin saves fail the CSRF check.
- Media URLs stay relative (no `serverURL` in the Payload config); set `csrf: ['https://<domain>']` explicitly before production.
- Backups: nightly `mongodump` plus the `media/` folder, copied off the server.
- The VPS needs at least 2 GB RAM (or swap) for `next build`.
- The seed script must never run in production.

### Deployment identity

Medval Venezuela deploys separately from the international Medval site. Use
remote directory `/srv/medval-ve`, Compose project `medval-ve`, image/container
and nginx upstream `medval-ve-web`, MongoDB database `medval_ve`, and default
network `medval-ve_default`. The GitHub Environments are `staging` and
`production`; their variable names are unchanged. The canonical checklist lives
in [FORK.md](FORK.md#deployment-identity) and
[deploy/README.md](deploy/README.md).

---

## Getting started

> Target workflow once WEB-01 and WEB-49 are done.

```bash
cp .env.example .env
docker compose up        # Next.js + Payload + Mongo replica set
pnpm seed                # content in 2 languages, 4 regions and the demo catalog (dev/staging only)
```

- Site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

On a server, the image ships a pre-bundled seed (`seed.mjs`) for the staging
placeholder content. Add `SEED_ALLOWED=1` to the staging server's `.env` first
(never on production), then:

```bash
docker compose -p medval-ve exec web node seed.mjs
```

### First administrator

When there are no users, open `/admin` and create the first account. The app
automatically assigns this unauthenticated first registration the `admin` role
only when there are no existing accounts.

Create this account before exposing the app publicly. Any later unauthenticated
server-side user creation is assigned the `editor` role; only an authenticated
admin can assign the `admin` role. Concurrent initial registrations cannot
create multiple admins.
After that, only an admin can create or manage users; client accounts should use
the `editor` role.

---

## Content model

The layout is fixed and the client edits content inside it: texts and images, not adding, removing or reordering sections. *(Pending confirmation.)*

| Name | Type | Localized by language | Holds | Who edits |
| --- | --- | --- | --- | --- |
| Landing | Global | Yes | One tab per homepage section (Inicio, Nosotros, Especialidades, Productos, Servicios, Certificaciones, Alianzas, Cierre, Contacto): headings, body text, images, cards, process steps and partner logos | Client (editor) |
| Regions | Collection | Yes | One row per region: company name, WhatsApp, phone, email, address, SEO title/description, OG image | Admin creates rows; client (editor) edits values |
| Site Settings | Global | No | Shared logo and social links | Client (editor) |
| Media | Collection | Alt text | Uploaded images with required alt text and generated sizes | Client (editor) |
| Catalog Items | Collection | Yes | Demo pharmaceutical catalog: name, active ingredient, concentration, form, presentation, laboratory, registration, indications, warnings, keywords, photos, published flag | Client (editor) adds, edits and removes products |
| Quote Requests | Collection | No (stores region and language) | Contact and quote form submissions: name, email, phone, region, language, service, message, date | Client reads; public cannot read |
| Users | Collection | No | Accounts with roles: admin (us) and editor (client) | Admin only |

The catalog has dedicated pages at `/es/int/catalogo` and `/en/int/catalogo`.
Search and category filters query the complete database, returning 12 products
per page with shareable `q`, `category` and `page` parameters. Editors add, change,
unpublish and delete products in `/admin/collections/catalog-items`; search text
is updated automatically. There is no price, cart or checkout.

The versioned `20261028_160000_catalog_page_content` production migration imports
the four supplied medicines and three representative photos each. Existing
products and media are preserved. This is a catalog-only content release, not
the development placeholder seed; no globals, contacts or users are overwritten.
Do not run `pnpm seed` in production. See [ADR 0005](docs/adr/0005-catalog-page-and-content-import.md).

Empty Landing fields fall back to the approved copy in `src/i18n/home.ts`, so the page keeps its current content until an editor fills a field. Draft edits are visible at `/preview?global=landing&locale=es|en`; click **Publicar cambios** to apply them to the public site.

**Pages:** `/{language}/{region}` gives eight combinations, such as `/es/ve` and `/en/ve`. The region selector and ES/EN toggle remember independent preferences. `/` temporarily redirects using cookies, then `Accept-Language`, then `es/int`; old region-only URLs permanently redirect to their default-language page. Missing language values fall back to Spanish; missing regional values fall back to the international row. Editors author translations manually; the admin interface remains Spanish.

**Existing databases:** the registered `20261002_120000_language_region_split` migration runs through Payload's production migration mechanism at startup. It moves regional settings into Regions, remaps localized content (including nested arrays and draft versions) to `es`/`en`, and renames historical submissions' `country` to `region`, leaving their language unknown. The merge of the former Spanish versions cannot be reversed exactly: retain a database backup before the first deployment, and restore it together with the previous image if rollback is needed. Do not use the seed script to migrate production content.

**Checks:** run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test:int`, and `pnpm test:e2e`. The integration suite needs MongoDB; its migration test creates and removes its own disposable database. Set `PLAYWRIGHT_BASE_URL` to use an alternate local test port (test tooling only). Browser tests require seeded content and the matching `NEXT_PUBLIC_SERVER_URL` used to build or run the app.

---

## Backlog

9 epics, 56 stories, about 181 story points. Points use 1 / 2 / 3 / 5 / 8. **Must** = required for launch, **Should** = strongly recommended, **Could** = cut first if time runs short.

### E1 · Setup and infrastructure (17 pts)

| ID | Story | Acceptance criteria | Pts | Priority |
| --- | --- | --- | --- | --- |
| WEB-01 | As a dev, I can run the whole stack locally with one command | `docker compose up` starts Next.js + Payload + Mongo replica set; README explains setup | 3 | Must |
| WEB-02 | As a dev, I have a repo with lint, format and type checks | ESLint, Prettier, `tsc` run in CI on every PR; main branch protected | 2 | Must |
| WEB-03 | As a team, we have a staging environment | Staging URL on the VPS behind Caddy with HTTPS and basic auth | 3 | Must |
| WEB-04 | As a team, we have a production environment | Production compose file, env vars documented, CSRF origin set, Mongo port not exposed | 3 | Must |
| WEB-05 | As the owner, data is backed up | Nightly `mongodump` + `media/` copied off-server; restore tested once | 3 | Must |
| WEB-06 | As a dev, deploys are repeatable | Deploy script or CI job builds and restarts containers with zero manual edits | 3 | Should |

### E2 · Content model and admin (27 pts)

| ID | Story | Acceptance criteria | Pts | Priority |
| --- | --- | --- | --- | --- |
| WEB-07 | As an admin, I can manage users with roles | Admin and editor roles; editor cannot manage users or settings outside content | 3 | Must |
| WEB-08 | As the client, the admin is in Spanish | Admin UI in Spanish; every field has a Spanish label and help text | 2 | Must |
| WEB-09 | As the client, I can edit content per country | Localization with `int` + 3 country locales; empty fields fall back to `int` | 5 | Must |
| WEB-10 | As the client, I can edit every section's text and images | Landing global with one tab per section; array limits set (`maxRows`) | 5 | Must |
| WEB-11 | As the client, I can edit contact data and social links per country | Site Settings global localized: WhatsApp, phone, email, socials, logo | 2 | Must |
| WEB-12 | As the client, I can upload images safely | Media collection with required alt text, recommended sizes in help text, auto-generated sizes | 2 | Must |
| WEB-13 | As the client, I see changes before publishing | Drafts + live preview working for Landing and Site Settings | 3 | Should |
| WEB-14 | As the client, I can see form submissions | Quote Requests list visible to editor, filterable by country, read-only | 2 | Must |
| WEB-49 | As a dev, I can build without client content | Seed script fills every global in all 4 locales with realistic placeholder text and images; runs with one command; blocked from running in production | 3 | Must |

### E3 · Design (24 pts, Aaron)

Aaron designs the site, starting from the client's brand guide and SVG logo.

| ID | Story | Acceptance criteria | Pts | Priority |
| --- | --- | --- | --- | --- |
| WEB-15 | As the client, I see a visual direction based on my brand | Style direction (color, type, imagery, motion mood) built from the brand guide and approved by the client | 3 | Must |
| WEB-16 | As a dev, I have a design system | Colors, typography scale, spacing, buttons, form fields, icons defined as tokens from the brand guide | 3 | Must |
| WEB-17 | As the client, I approve a high-impact home design | Desktop + mobile hi-fi for Home approved | 5 | Must |
| WEB-18 | As the client, I approve the remaining 4 sections | Desktop + mobile hi-fi for the other 4 sections approved | 8 | Must |
| WEB-19 | As a dev, I know how things move | Motion spec per section: effect, library (Motion or GSAP), trigger, timing | 3 | Must |
| WEB-20 | As a dev, I have production-ready assets | Exported SVG icons, optimized images, fonts with licenses confirmed | 2 | Must |

### E4 · Frontend sections (31 pts)

| ID | Story | Acceptance criteria | Pts | Priority |
| --- | --- | --- | --- | --- |
| WEB-21 | As a visitor, I get the right country version | `/<locale>/` routing; root serves `int`; header country switcher remembers choice in a cookie | 5 | Must |
| WEB-22 | As a visitor, I can navigate the site | Header with section anchors, mobile menu, footer with socials and contact data | 3 | Must |
| WEB-23 | As a visitor, I see a high-impact home | Home built to approved design, all content from CMS | 5 | Must |
| WEB-24 | As a visitor, I see Services | Service cards from CMS, matches design on all breakpoints | 3 | Must |
| WEB-25 | As a visitor, I see About | About section from CMS, matches design | 2 | Must |
| WEB-26 | As a visitor, I can browse a dynamic gallery | Gallery from CMS with lightbox, swipe on mobile, lazy-loaded images | 5 | Must |
| WEB-27 | As a visitor, I see Contact | Contact section with form, map or address, country contact data | 3 | Must |
| WEB-28 | As a visitor, the site works on any device | Verified at 360, 768, 1024, 1440 px widths; no horizontal scroll | 5 | Must |

### E5 · Animations and interactions (28 pts)

| ID | Story | Acceptance criteria | Pts | Priority |
| --- | --- | --- | --- | --- |
| WEB-47 | As a dev, I have one animation stack for the whole site | Motion, GSAP + ScrollTrigger and Lenis installed; shared easings and durations in one module; GSAP set up with `useGSAP` so animations clean up on unmount | 2 | Must |
| WEB-45 | As a designer, I have the logo ready to animate | Client's SVG logo cleaned and split into named layers + an animation storyboard approved by the client | 3 | Must |
| WEB-46 | As a visitor, I see an animated logo only while the site loads | Loader built with Motion; stays until fonts and hero media are ready, then exits with a transition into Home; no flash on fast connections (minimum duration set by Aaron); no layout shift; respects `prefers-reduced-motion` | 5 | Must |
| WEB-48 | As a visitor, scrolling feels smooth | Lenis enabled and synced with ScrollTrigger; anchors and the mobile menu still work; off with `prefers-reduced-motion` | 2 | Must |
| WEB-29 | As a visitor, sections reveal as I scroll | Scroll-triggered reveals per motion spec | 3 | Must |
| WEB-30 | As a visitor, I see elaborate scroll effects | Pinned, scrubbed and parallax effects on Home and Gallery with GSAP ScrollTrigger, per motion spec | 5 | Must |
| WEB-31 | As a visitor, I see custom transitions between sections | Transitions implemented per spec, 60 fps on a mid-range phone | 3 | Must |
| WEB-32 | As a visitor, interactive elements respond to me | Hover, tap and cursor interactions per spec | 3 | Must |
| WEB-33 | As a visitor who prefers less motion, I'm respected | `prefers-reduced-motion` disables heavy effects site-wide | 2 | Should |

### E6 · Forms and conversion (15 pts)

| ID | Story | Acceptance criteria | Pts | Priority |
| --- | --- | --- | --- | --- |
| WEB-34 | As a visitor, I can send a contact message | Validated form; saved to Quote Requests with country; success and error states | 3 | Must |
| WEB-35 | As a visitor, I can request a quote | Quote form with service selector; saved with type = quote | 3 | Must |
| WEB-36 | As the client, I get notified | Email to the country's inbox on each submission; sender domain verified | 3 | Must |
| WEB-37 | As the client, I'm protected from spam | Honeypot + rate limit on the server action | 2 | Must |
| WEB-38 | As a visitor, I can reach the company on WhatsApp | Floating button + CTAs open WhatsApp with the country number and a prefilled message | 2 | Must |
| WEB-39 | As a visitor, I can find the social profiles | Social icons from Site Settings, open in a new tab | 2 | Must |

### E7 · SEO and analytics (10 pts)

| ID | Story | Acceptance criteria | Pts | Priority |
| --- | --- | --- | --- | --- |
| WEB-40 | As the client, the site is findable | Title, description, OG image per locale; `hreflang` between versions; sitemap.xml; robots.txt | 5 | Must |
| WEB-41 | As the client, I can measure traffic and leads | GA4 installed; events for form submit, quote submit and WhatsApp click, with country | 3 | Must |
| WEB-42 | As a visitor, pages load fast | Lighthouse mobile ≥ 85 performance, ≥ 90 SEO and accessibility on staging | 2 | Should |

### E8 · QA on staging (8 pts)

| ID | Story | Acceptance criteria | Pts | Priority |
| --- | --- | --- | --- | --- |
| WEB-43 | As the team, the build is solid before real content arrives | QA on staging with placeholder content: Chrome, Safari (iOS), Firefox, Edge; all 4 locales; forms, loader and animations checked | 5 | Must |
| WEB-56 | As a dev, the layout survives any content | Stress test with very long and very short copy, missing images and unusual image ratios; nothing overflows or breaks | 3 | Must |

### E9 · Client content and go-live (21 pts) — last phase

Everything before E9 is built on seeded placeholder content (WEB-49), so the team never waits on the client. E9 starts when the client's material arrives and ends at launch.

| ID | Story | Acceptance criteria | Pts | Priority |
| --- | --- | --- | --- | --- |
| WEB-50 | As the team, we track what the client has sent | Intake table kept current; an item is loaded only when complete for every locale | 2 | Must |
| WEB-51 | As a dev, real copy replaces the placeholders | All Landing tabs and SEO fields filled per locale (admin or import script); seed data never reaches production | 5 | Must |
| WEB-52 | As a dev, real images replace the placeholders | Images optimized and uploaded to Media with alt text; crops checked on all breakpoints | 3 | Must |
| WEB-53 | As a dev, country settings are final | Final locale codes in config; WhatsApp, phone, email, socials, form inboxes and GA4 ID set per country | 2 | Must |
| WEB-54 | As a team, real content doesn't break the layout | QA pass of all 4 locales with real content at 360 to 1440 px; fallback to `int` verified | 3 | Must |
| WEB-55 | As a team, the site goes live | Domain DNS pointed, HTTPS via Caddy, CSRF origin set to the domain, email sending domain verified, sitemap submitted to Search Console | 3 | Must |
| WEB-44 | As the client, I know how to use the admin | 3 to 5 min screen recording on real content: change a text and an image | 3 | Must |

---

## Sprint plan

Weeks 1 to 4 build the whole site on placeholder content. The content phase starts once the client's material arrives and ends at launch.

| Epic | Week 1 | Week 2 | Week 3 | Week 4 | Content phase |
| --- | :---: | :---: | :---: | :---: | :---: |
| E1 Setup and infra | ■ | ▧ | | | |
| E2 Content model, admin | ▧ | ■ | | | |
| E3 Design | ■ | ■ | | | |
| E4 Frontend sections | | ■ | ■ | | |
| E5 Animations | | | ■ | ▧ | |
| E6 Forms and conversion | | | ■ | | |
| E7 SEO and analytics | | | | ■ | |
| E8 QA on staging | | | | ■ | |
| E9 Client content, go-live | | | | | ■ |

■ full week · ▧ half week

**Gates**

1. End of Week 1: design direction approved.
2. Start of content phase: client content received.
3. End of content phase: launch.

---

## Client content intake

Update the **Status** column as material arrives.

| Item | Per country | Goes into | Story | Status |
| --- | --- | --- | --- | --- |
| The three countries (locale codes) | No | Payload localization config | WEB-53 | Pending |
| Auto-open by visitor country, or international + switcher | No | Routing middleware | WEB-21 | Pending |
| Final section names and copy | Yes | Landing global | WEB-51 | Pending |
| Services list | Yes | Landing › Services | WEB-51 | Pending |
| Photos and gallery images | Yes | Media + Landing | WEB-52 | Pending |
| WhatsApp number and prefilled message | Yes | Site Settings | WEB-53 | Pending |
| Phone, email, address | Yes | Site Settings | WEB-53 | Pending |
| Social profile links | Yes | Site Settings | WEB-53 | Pending |
| Inbox for form submissions | Yes | Email notification config | WEB-53 | Pending |
| SEO titles, descriptions, share image | Yes | Site Settings | WEB-51 | Pending |
| GA4 property ID | No | Environment variables | WEB-53 | Pending |
| Domain and DNS access | No | DNS + Caddy | WEB-55 | Pending |
| DNS records for the email sending domain | No | Email adapter | WEB-55 | Pending |

---

## Definition of done

A story is done when:

- It meets every acceptance criterion and matches the approved design on phone, tablet and desktop.
- All its content comes from the CMS (no hardcoded client text) and works in all 4 locales.
- It passes lint, type check and review, and is merged to `main`.
- It is deployed to staging and checked there by someone other than its author.

## Technical risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Real content differs from placeholders (longer text, other image ratios) | Layout breaks in the last phase | Stress test in WEB-56; image fields with fixed crops and help text on sizes |
| Design changes after frontend starts | Rework in E4 and E5 | Build from design tokens; lock the Home design before WEB-23 starts |
| Heavy animations hurt mobile performance | Poor Lighthouse score, janky scroll | Test on a real mid-range phone weekly; reduced-motion fallback |
| Three animation libraries on one page | Conflicts on the same element, larger bundle | One library per job (see [Animation stack](#animation-stack)); GSAP loaded only on sections that use it |
| Small VPS runs out of memory | Failed builds or crashes | 2 GB RAM minimum or swap; Mongo cache capped |
