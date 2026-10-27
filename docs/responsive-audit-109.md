# Desktop/mobile coherence audit — task 109

Tracking: [GitHub #169](https://github.com/aaronx3011/medval-landing/issues/169),
linked from [WEB-28 / #33](https://github.com/aaronx3011/medval-landing/issues/33).

## Findings recorded before implementation

| Finding | Evidence | Change |
| --- | --- | --- |
| Inconsistent service heading hierarchy | 34px at 600px, 21.37px at 641px; 22.91px on a 320px phone | Allow highlighted phrases to wrap; maintain at least 32px headings and a 1.08 line height. Stack tablet service copy and illustrations through 900px. |
| Cramped cards | Specialty cards 134px wide at 320px; product cards 166px wide at 641px | Single-column specialties through 380px; single-column products through 900px with a 620px maximum width; equal-height specialty cards. |
| Undersized touch targets | Language buttons 34–37px, menu 40px, contact links 21px, footer links 28px | At least 44px high for header controls, navigation, and contact/footer links; language buttons also 44px wide. |
| Mobile form focus zoom risk | Form controls use 15px text | Increase input/select/textarea text to 16px while preserving existing labels and validation. |
| Incomplete reduced-motion behavior | Section/text reveals and specialty idle highlights continue with reduced motion | Disable home CSS motion/reveal hiding, bypass GSAP text reveals, and subscribe to live preference changes for reveals, hero rotation, highlights, and counters. |

The findings and implementation plan were published to GitHub and the task
coordinator before editing. All work stayed within this repository. Existing
uncommitted hero photography, copy, section-order, and watermark work was retained.

## Implementation sequence

1. Correct service typography and phone/tablet card layouts.
2. Enlarge touch targets and form text, preserving compact-header containment.
3. Synchronize JavaScript motion with the system preference, including changes
   during a visit and immediate final counter values.
4. Add browser regressions for breakpoint readability, expanded card copy,
   touch targets, full-document overflow, and live motion changes.
5. Run browser checks, integration checks, static checks, and a two-axis review.

## Verification

- Chromium ES/EN header matrix: 320, 360, 390, 600, 640, 641, 768, 1024, 1121,
  1280, 1281, 1440, and 1920px, before/after scroll and with the menu open.
- Readability/touch matrix: 320, 360, 390, 600, 601, 641, 768, 900, 1024, 1440,
  and 1920px. All service headings retain at least 32px text; measured controls
  are at least 44px high; fields use at least 16px text.
- Full-page overflow and every specialty's expanded description checked in ES/EN
  at 320, 360, 768, 1024, 1440, and 1920px, with normal and reduced motion.
- Short landscape: 640×320 menu and 844×390 services, normal/reduced motion.
- Hero rotation keeps its headline, CTA, and following content stable at 320px.
- Live reduced-motion preference changes stop hero rotation/highlighting,
  reveal all content, and display final counter values.
- `int`, `ve`, `us`, and `co` Spanish paths verified; the latter three correctly
  redirect to the shared `/es/int` landing under the current routing policy.
- `pnpm lint`, `pnpm typecheck`, and `pnpm format:check` pass.
- Broad browser run: all 36 frontend/visibility/responsive tests passed before
  the final review additions. The five new/extended responsive scenarios also
  passed after addressing review feedback.
- Integration suite: 64 tests passed; the two database-dependent tests initially
  timed out because the shell could not resolve Docker's `mongo` hostname. Both
  passed when rerun with the existing local Mongo instance via a process-only
  `DATABASE_URI=mongodb://127.0.0.1:27017/medval?directConnection=true` override.
- Admin rerun using that override: dashboard passed; list/edit tests failed
  because the users collection routes showed “No encontrado.” This is separate
  from frontend responsive styling; no admin/access changes were made. Follow-up:
  [GitHub #170](https://github.com/aaronx3011/medval-landing/issues/170), MCP task 110.

## Visual evidence

Screenshots are in `docs/comparaciones/`:

- `hero-before-{390,768,1440}.png`: viewport captures of the existing hero.
- `responsive-after-{es,en}-{320,768,1440}.png`: full-page reduced-motion captures
  with all content visible.
- `cards-after-{320,768,1440}.png` and `service-after-{320,768,1440}.png`:
  detailed section captures. Fixed headers may appear over these element captures
  because Playwright scrolls the element into view before capture.

Earlier `responsive-before-*` full-page captures retain offscreen animation
states; they are diagnostic artifacts, not evidence of missing content.

## Review and handoff

Standards review found no actionable violations. Specification review identified
live counter handling and normal-motion/1920px coverage gaps; both were addressed.
Changes are local on `fix/responsive-coherence-109`. No environment variables,
schema generation, server changes, or deployment actions are required.
