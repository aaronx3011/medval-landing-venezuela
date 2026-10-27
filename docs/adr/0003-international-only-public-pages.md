# One international public site in two languages

The owner chose a single international offering instead of separate public market versions. The public pages are now `/es/int` and `/en/int`, with language switching but no region dropdown in the header or contact form; new public form submissions use `int` automatically.

This supersedes ADR-0001's eight-page public routing policy and ADR-0002's per-region public page selection. Existing country URLs permanently redirect to the international page in the same language, while the root remembers only the visitor's language preference. Canonicals, hreflang, and the sitemap expose only the international pages.

The regions collection and historical region codes remain available to preserve existing CMS content and submissions; no data migration or deletion is required. Keeping the `/int` suffix avoids another URL-shape change while consolidating the public site.
