# Content is localized by language; regions are a table

Payload's `localization.locales` used to be the four region codes (`int`, `ve`, `us`, `co`), which conflated "market" with "language" and forced one fixed language per region. The model is now two axes:

- **Language** is the Payload localization axis (`locales: ['es', 'en']`, `defaultLocale: 'es'`, `fallback: true`). The `landing` global holds the marketing copy in two versions.
- **Region** is a `regions` collection with one row per market (`int`, `ve`, `us`, `co`). Its localized fields (company name, WhatsApp, phone, email, address, SEO title/description, OG image) are what differ per region, and each is editable per language in the admin — no automatic translation is ever applied.

Pages compose the two: the `{language}` segment selects the Landing copy version, the `{region}` segment selects the region row.

Considered: eight independent Payload locales (one content version per region×language, `es-ve`, `en-us`, …). Rejected because it multiplies maintenance 4× for copy that should be identical per language, and Payload's single-`defaultLocale` fallback would silently leak *other regions'* content into untranslated versions (an untranslated `en-ve` falls back to the default locale, not to `es-ve`). The region table keeps copy at two versions while still giving editors full per-region, per-language control over everything that actually differs.

Consequence: a one-time data migration moves per-region fields out of the `site-settings` global into the `regions` table and remaps the stored localized values from the old four region-locale keys to the new `es`/`en` keys (Spanish versions collapse into `es`, the English `us` version becomes `en`).
