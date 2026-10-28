# Catalog items are Payload documents, searched in the browser

**Status:** the client-side search and homepage placement are superseded by
[ADR 0005](0005-catalog-page-and-content-import.md). The storage model remains.

The demo catalog is a `catalog-items` collection in MongoDB, managed from the
Payload admin at `/admin/collections/catalog-items`. Each item holds localized
Spanish/English copy (`name`, `description`, `activeIngredient`,
`pharmaceuticalForm`, `presentation`, `indications`, `warnings`, `keywords`)
plus shared facts (`slug`, `category`, `concentration`, `laboratory`,
`registrationNumber`, `prescriptionRequired`, `published`) and one to eight
`media` uploads. The first upload is the card image; the rest form the detail
gallery.

The public homepage fetches published items with the Local API in the page’s
language, flattens them into serializable `CatalogItemView` objects, and hands
them to a client component. Search is accent-insensitive, all-terms matching
over name, active ingredient, description, presentation, laboratory, category,
keywords and the other visible facts, with category chips as an additional
filter. With a demo-sized catalog this avoids a request per keystroke and keeps
the section usable while offline after the page loads.

Considered: a dedicated search endpoint that queries MongoDB on every keystroke.
Rejected for the demo because the payload is a few kilobytes and an API hop adds
latency, error states and rate-limit concerns without user-visible benefit. If
the catalog grows beyond a few hundred items, move `searchCatalogItems` behind
a `/api/catalog/search` route or a MongoDB text index and keep the same view
shape; the component contract does not change.

The catalog is informational only. It has no price, cart, checkout or purchase
action; the detail view ends with the prescription notice.
