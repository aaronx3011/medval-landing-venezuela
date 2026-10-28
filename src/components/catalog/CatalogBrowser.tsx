'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { getCatalogStrings } from '@/i18n/catalog'
import { categoryLabel, catalogCategoryOrder, type CatalogItemView } from '@/lib/catalog'
import { catalogHref, type CatalogQuery } from '@/lib/catalogQuery'
import type { LanguageCode } from '@/regions'

type CatalogBrowserProps = {
  items: CatalogItemView[]
  language: LanguageCode
  query: CatalogQuery
  totalDocs: number
  totalPages: number
}

// Only the supplied original pack shots get art-directed storefront covers.
// Newly uploaded photos use their own image, so editors retain image control.
const suppliedCovers: Record<string, string> = {
  'catalog-amk-01.jpg': '/catalog-covers/amk.webp',
  'catalog-agua-01.jpg': '/catalog-covers/agua.webp',
  'catalog-albumina-01.jpg': '/catalog-covers/albumina.webp',
  'catalog-alnex-01.jpg': '/catalog-covers/alnex.webp',
}

const coverUrl = (url: string) => {
  const filename = url.split('?')[0].split('/').pop() ?? ''
  return suppliedCovers[filename] ?? url
}

const Icon = ({
  name,
  className,
}: {
  name: 'search' | 'close' | 'arrow' | 'filter' | 'sort' | 'grid' | 'document'
  className?: string
}) => (
  <svg
    aria-hidden="true"
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {name === 'search' ? (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ) : null}
    {name === 'close' ? <path d="m6 6 12 12M18 6 6 18" /> : null}
    {name === 'arrow' ? <path d="M4 12h16m-6-6 6 6-6 6" /> : null}
    {name === 'filter' ? (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <path d="M8 4v4m8 2v4m-6 2v4" />
      </>
    ) : null}
    {name === 'sort' ? <path d="M8 5v14m-3-3 3 3 3-3M14 6h6m-6 5h4m-4 5h2" /> : null}
    {name === 'grid' ? (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ) : null}
    {name === 'document' ? (
      <>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
        <path d="M14 3v6h6M8 13h8m-8 4h5" />
      </>
    ) : null}
  </svg>
)

export const CatalogBrowser = ({
  items,
  language,
  query,
  totalDocs,
  totalPages,
}: CatalogBrowserProps) => {
  const strings = getCatalogStrings(language)
  const base = `/${language}/int/catalogo`
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  )

  useEffect(() => {
    if (!selected) return
    const previousOverflow = document.body.style.overflow
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null)
      if (event.key === 'Tab') {
        const controls = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
          'button:not([disabled]), a[href]',
        )
        const first = controls?.[0]
        const last = controls?.[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      opener?.focus({ preventScroll: true })
    }
  }, [selected])

  const currentImage = selected?.images[activeImage] ?? selected?.images[0]
  const hasFilters = Boolean(query.q || query.category !== 'all')

  return (
    <div className="catalog-storefront" id="catalogo">
      <section className="catalog-hero" aria-labelledby="catalog-heading">
        <div className="catalog-container">
          <nav
            className="catalog-breadcrumb"
            aria-label={language === 'es' ? 'Ruta de navegación' : 'Breadcrumb'}
          >
            <Link href={`/${language}/int`}>{strings.home}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{strings.catalogTitle}</span>
          </nav>
          <div className="catalog-hero__layout">
            <div className="catalog-hero__copy">
              <span className="catalog-eyebrow">{strings.catalogEyebrow}</span>
              <h1 id="catalog-heading">{strings.heading}</h1>
              <p>{strings.lead}</p>
            </div>
            <form
              action={base}
              method="get"
              role="search"
              className="catalog-search"
              key={`${query.q}:${query.category}`}
            >
              <label htmlFor="catalog-search">{strings.searchPrompt}</label>
              <div className="catalog-search__field">
                <Icon name="search" />
                <input
                  id="catalog-search"
                  aria-label={strings.searchLabel}
                  autoComplete="off"
                  name="q"
                  maxLength={200}
                  placeholder={strings.searchPlaceholder}
                  type="search"
                  defaultValue={query.q}
                />
                {query.category !== 'all' ? (
                  <input type="hidden" name="category" value={query.category} />
                ) : null}
                <button type="submit">{strings.searchButton}</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="catalog-container catalog-layout">
        <aside className="catalog-sidebar" aria-label={strings.filterLabel}>
          <button
            className="catalog-filter-toggle"
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="catalog-categories"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Icon name="filter" />
            <span>{strings.filterToggle}</span>
            <span aria-hidden="true">{filtersOpen ? '−' : '+'}</span>
          </button>
          <div
            className={`catalog-categories${filtersOpen ? ' is-open' : ''}`}
            id="catalog-categories"
          >
            <h2>
              <Icon name="grid" />
              {strings.categoriesHeading}
            </h2>
            <nav aria-label={strings.categoriesHeading}>
              <Link
                aria-current={query.category === 'all' ? 'true' : undefined}
                className={query.category === 'all' ? 'is-active' : undefined}
                href={catalogHref(base, { ...query, category: 'all', page: 1 })}
              >
                {strings.allCategories}
                <span aria-hidden="true">›</span>
              </Link>
              {catalogCategoryOrder.map((category) => (
                <Link
                  key={category}
                  aria-current={query.category === category ? 'true' : undefined}
                  className={query.category === category ? 'is-active' : undefined}
                  href={catalogHref(base, { ...query, category, page: 1 })}
                >
                  {categoryLabel(category, language)}
                  <span aria-hidden="true">›</span>
                </Link>
              ))}
            </nav>
            <div className="catalog-sidebar__note">
              <Icon name="document" />
              <p>
                {strings.productSheet}
                <span>
                  {strings.activeIngredient} · {strings.presentation}
                </span>
              </p>
            </div>
          </div>
        </aside>

        <section className="catalog-results" aria-labelledby="catalog-products-heading">
          <div className="catalog-toolbar">
            <div>
              <h2 id="catalog-products-heading">{strings.productsHeading}</h2>
              <span className="catalog-result-count" aria-live="polite">
                {strings.results(totalDocs)}
              </span>
            </div>
            <span className="catalog-sort">
              <Icon name="sort" />
              {strings.sortLabel}
            </span>
          </div>
          {hasFilters ? (
            <div className="catalog-active-filters">
              {query.q ? <span>“{query.q}”</span> : null}
              {query.category !== 'all' ? (
                <span>{categoryLabel(query.category, language)}</span>
              ) : null}
              <Link href={base}>
                {strings.clearFilters}
                <Icon name="close" />
              </Link>
            </div>
          ) : null}

          {items.length ? (
            <ul className="catalog-grid">
              {items.map((item) => (
                <li className="catalog-product" key={item.id}>
                  <button
                    type="button"
                    className="catalog-product__button"
                    aria-label={`${strings.viewDetails}: ${item.name}`}
                    onClick={() => {
                      setActiveImage(0)
                      setSelectedId(item.id)
                    }}
                  >
                    <span className="catalog-product__visual">
                      <span className="catalog-product__category">
                        {categoryLabel(item.category, language)}
                      </span>
                      {item.images[0] ? (
                        <Image
                          alt={item.images[0].alt}
                          src={coverUrl(item.images[0].url)}
                          width={480}
                          height={480}
                          sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 24vw"
                          loading="lazy"
                          unoptimized
                        />
                      ) : (
                        <Icon name="document" />
                      )}
                      {item.images.length > 1 ? (
                        <span className="catalog-product__photos">
                          {strings.photoCount(item.images.length)}
                        </span>
                      ) : null}
                    </span>
                    <span className="catalog-product__body">
                      <span className="catalog-product__maker">{item.laboratory}</span>
                      <span className="catalog-product__name">{item.name}</span>
                      <span className="catalog-product__ingredient">{item.activeIngredient}</span>
                      <span className="catalog-product__strength">{item.concentration}</span>
                      <span className="catalog-product__link">
                        {strings.details}
                        <span>
                          <Icon name="arrow" />
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="catalog-empty">
              <span>
                <Icon name="search" />
              </span>
              <h2>{hasFilters ? strings.noResultsTitle : strings.emptyTitle}</h2>
              <p>{hasFilters ? strings.noResultsBody : strings.emptyBody}</p>
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="catalog-pagination" aria-label={strings.pagination}>
              {query.page > 1 ? (
                <Link rel="prev" href={catalogHref(base, { ...query, page: query.page - 1 })}>
                  <Icon name="arrow" className="catalog-icon-reverse" />
                  {strings.previous}
                </Link>
              ) : (
                <span />
              )}
              <span>{strings.pageLabel(query.page, totalPages)}</span>
              {query.page < totalPages ? (
                <Link rel="next" href={catalogHref(base, { ...query, page: query.page + 1 })}>
                  {strings.next}
                  <Icon name="arrow" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </section>
      </div>

      <section className="catalog-assistance">
        <div className="catalog-container">
          <div>
            <h2>{strings.helpHeading}</h2>
            <p>{strings.helpBody}</p>
          </div>
          <Link href={`/${language}/int#contacto`}>
            {strings.contactTeam}
            <Icon name="arrow" />
          </Link>
        </div>
      </section>

      {selected ? (
        <div
          className="catalog-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedId(null)
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-detail-title"
            className="catalog-dialog"
            data-lenis-prevent
          >
            <button
              ref={closeButtonRef}
              className="catalog-dialog__close"
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label={strings.close}
            >
              <Icon name="close" />
            </button>
            <div className="catalog-gallery">
              <div className="catalog-gallery__image">
                <span className="catalog-gallery__count">
                  {activeImage + 1} / {selected.images.length}
                </span>
                {currentImage ? (
                  <Image
                    alt={currentImage.alt}
                    src={currentImage.url}
                    width={720}
                    height={720}
                    sizes="(max-width: 800px) 90vw, 45vw"
                    unoptimized
                  />
                ) : null}
                {selected.images.length > 1 ? (
                  <div className="catalog-gallery__arrows">
                    <button
                      type="button"
                      aria-label={strings.previousImage}
                      onClick={() =>
                        setActiveImage(
                          (activeImage + selected.images.length - 1) % selected.images.length,
                        )
                      }
                    >
                      <Icon name="arrow" className="catalog-icon-reverse" />
                    </button>
                    <button
                      type="button"
                      aria-label={strings.nextImage}
                      onClick={() => setActiveImage((activeImage + 1) % selected.images.length)}
                    >
                      <Icon name="arrow" />
                    </button>
                  </div>
                ) : null}
              </div>
              {selected.images.length > 1 ? (
                <div className="catalog-gallery__thumbs">
                  {selected.images.map((image, index) => (
                    <button
                      key={image.url}
                      className={index === activeImage ? 'is-active' : undefined}
                      type="button"
                      aria-label={strings.imageLabel(index + 1, selected.images.length)}
                      aria-pressed={index === activeImage}
                      onClick={() => setActiveImage(index)}
                    >
                      <Image
                        alt=""
                        src={image.url}
                        width={100}
                        height={100}
                        loading="lazy"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="catalog-detail">
              <span className="catalog-eyebrow">{selected.laboratory}</span>
              <h2 id="catalog-detail-title">{selected.name}</h2>
              <div className="catalog-detail__tags">
                <span>{categoryLabel(selected.category, language)}</span>
                <span>{selected.concentration}</span>
              </div>
              <p className="catalog-detail__description">{selected.description}</p>
              <h3 className="catalog-detail__label">{strings.productSheet}</h3>
              <dl className="catalog-detail__facts">
                <div>
                  <dt>{strings.activeIngredient}</dt>
                  <dd>{selected.activeIngredient}</dd>
                </div>
                <div>
                  <dt>{strings.form}</dt>
                  <dd>{selected.pharmaceuticalForm}</dd>
                </div>
                <div>
                  <dt>{strings.presentation}</dt>
                  <dd>{selected.presentation}</dd>
                </div>
                <div>
                  <dt>{strings.laboratory}</dt>
                  <dd>{selected.laboratory}</dd>
                </div>
                {selected.registrationNumber ? (
                  <div>
                    <dt>{strings.registration}</dt>
                    <dd>{selected.registrationNumber}</dd>
                  </div>
                ) : null}
              </dl>
              {selected.indications ? (
                <section className="catalog-detail__section">
                  <h3>{strings.indications}</h3>
                  <p>{selected.indications}</p>
                </section>
              ) : null}
              {selected.warnings ? (
                <section className="catalog-detail__section">
                  <h3>{strings.warnings}</h3>
                  <p>{selected.warnings}</p>
                </section>
              ) : null}
              {selected.prescriptionRequired ? (
                <p className="catalog-detail__prescription">
                  <Icon name="document" />
                  {strings.prescriptionNote}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
