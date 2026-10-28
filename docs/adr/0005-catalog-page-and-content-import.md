# A dedicated catalog page queries the database one page at a time

The owner expects 100+ products, so the catalog moves from a homepage section
to `/es/int/catalogo` and `/en/int/catalogo`. GET parameters (`q`, `category`,
`page`) drive database-side search and pagination: 12 products per response,
stable name/id ordering, and a mandatory published filter. The former 100-item
fetch ceiling and browser-side filtering must not hide later products.

Payload maintains an accent-folded, localized `searchText` on writes. Queries
require all search terms to occur in that field. This keeps substring matching
and Spanish/English behavior without a search service. Category and publication
are indexed; normalized substring search still scans matching documents, which
is appropriate for hundreds of products, not a full-text engine for millions.

The four supplied medicines are loaded by a versioned, catalog-only content
migration using Payload's migration request/transaction. It uploads three JPEG
photos per medicine, creates both languages, skips existing slugs/media, and
backfills search text for existing products. It never changes landing globals,
contacts, users or credentials and never calls the development seed. The source
photos are explicitly copied into the runtime image under `/app/catalog-import`.

Rollback preserves products and media because editors may have changed them.
Running `up` again preserves existing products, including unpublished ones;
it does not reset editorial content. Unclear registration numbers are omitted
rather than guessed. No price, cart or checkout is introduced.
