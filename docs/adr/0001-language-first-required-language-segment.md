# Language-first URLs with a required language segment

The site used to serve one page per region at `/{region}` (`/ve`, `/us`, …) with a fixed language per region. Since each region must now be available in both Spanish and English, pages are served at `/{language}/{region}` (e.g. `/es/ve`, `/en/us`), with the language segment **required**.

Language-first (rather than region-first `/ve/en`) keeps the ecosystem-standard i18n URL shape, so SEO tooling, next-intl-style conventions, and any future i18n library work with it unchanged. The eight pages map one-to-one onto language-scoped URL prefixes, which makes canonical URLs and hreflang trivial to reason about.

The four legacy region-only URLs get 301 redirects to their default-language page (`/ve` → `/es/ve`, `/us` → `/en/us`, `/co` → `/es/co`, `/int` → `/es/int`); the root `/` 302-redirects using the visitor's stored preferences or `Accept-Language`.

Considered: region-first URLs (`/ve/es`) — rejected because the region is not a technical locale prefix and non-standard shapes confuse SEO tooling. Optional language segment (`/ve` still a valid 200) — rejected because it creates duplicate-content URLs that need canonical tag surgery.
