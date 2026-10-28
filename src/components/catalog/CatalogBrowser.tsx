'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { getCatalogStrings } from '@/i18n/catalog'
import { categoryLabel, catalogCategoryOrder, type CatalogItemView } from '@/lib/catalog'
import type { LanguageCode } from '@/regions'
import { catalogHref, type CatalogQuery } from '@/lib/catalogQuery'

type CatalogBrowserProps = {
  items: CatalogItemView[]
  language: LanguageCode
  query: CatalogQuery
  totalDocs: number
  totalPages: number
}

const SearchIcon = () => (
  <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path d="m16.2 16.2 4.3 4.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
  </svg>
)

const CloseIcon = () => (
  <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
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
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  )

  useEffect(() => {
    if (!selected) return

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selected])

  const currentImage = selected?.images[activeImage] ?? selected?.images[0] ?? null

  return (
    <div className="impilo-catalog catalog-page" id="catalogo">
      <div className="impilo-catalog__inner">
        <span className="impilo-catalog__eyebrow">{strings.catalogEyebrow}</span>
        <h1 id="catalog-heading">{strings.heading}</h1>
        <p className="impilo-catalog__lead">{strings.lead}</p>

        <form
          action={base}
          method="get"
          role="search"
          className="impilo-catalog__search catalog-page__search"
          key={`${query.q}:${query.category}`}
        >
          <span aria-hidden="true" className="impilo-catalog__search-icon">
            <SearchIcon />
          </span>
          <label className="impilo-visually-hidden" htmlFor="catalog-search">
            {strings.searchLabel}
          </label>
          <input
            autoComplete="off"
            id="catalog-search"
            name="q"
            maxLength={200}
            placeholder={strings.searchPlaceholder}
            type="search"
            defaultValue={query.q}
          />
          {query.category !== 'all' ? (
            <input type="hidden" name="category" value={query.category} />
          ) : null}
          <button type="submit" className="catalog-page__submit">
            {strings.searchButton}
          </button>
        </form>

        <>
          <div aria-label={strings.filterLabel} className="impilo-catalog__filters" role="group">
            <Link
              aria-current={query.category === 'all' ? 'true' : undefined}
              className={`impilo-catalog__chip${query.category === 'all' ? ' is-active' : ''}`}
              href={catalogHref(base, { ...query, category: 'all', page: 1 })}
            >
              {strings.allCategories}
            </Link>
            {catalogCategoryOrder.map((value) => (
              <Link
                aria-current={query.category === value ? 'true' : undefined}
                className={`impilo-catalog__chip${query.category === value ? ' is-active' : ''}`}
                key={value}
                href={catalogHref(base, { ...query, category: value, page: 1 })}
              >
                {categoryLabel(value, language)}
              </Link>
            ))}
          </div>
        </>

        <p aria-live="polite" className="impilo-catalog__count">
          {strings.results(totalDocs)}
        </p>
        {query.q || query.category !== 'all' ? (
          <Link className="catalog-page__reset" href={base}>
            {strings.clearFilters}
          </Link>
        ) : null}

        {items.length > 0 ? (
          <ul className="impilo-catalog__grid">
            {items.map((item) => {
              const image = item.images[0]

              return (
                <li className="impilo-catalog-card" key={item.id}>
                  <button
                    aria-label={`${strings.viewDetails}: ${item.name}`}
                    className="impilo-catalog-card__button"
                    onClick={() => {
                      setActiveImage(0)
                      setSelectedId(item.id)
                    }}
                    type="button"
                  >
                    <span className="impilo-catalog-card__media">
                      {image ? (
                        <Image
                          alt={image.alt}
                          height={420}
                          loading="lazy"
                          sizes="(max-width: 680px) 90vw, (max-width: 1024px) 45vw, 30vw"
                          src={image.url}
                          unoptimized
                          width={560}
                        />
                      ) : null}
                    </span>

                    <span className="impilo-catalog-card__body">
                      <span className="impilo-catalog-card__category">
                        {categoryLabel(item.category, language)}
                      </span>
                      <span className="impilo-catalog-card__name">{item.name}</span>
                      <span className="impilo-catalog-card__active">{item.activeIngredient}</span>
                      <span className="impilo-catalog-card__meta">
                        {[item.concentration, item.pharmaceuticalForm].filter(Boolean).join(' · ')}
                      </span>
                      <span className="impilo-catalog-card__link">{strings.details}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="impilo-catalog__empty">
            <h2>
              {query.q || query.category !== 'all' ? strings.noResultsTitle : strings.emptyTitle}
            </h2>
            <p>{query.q || query.category !== 'all' ? strings.noResultsBody : strings.emptyBody}</p>
          </div>
        )}
        {totalPages > 1 ? (
          <nav className="catalog-page__pagination" aria-label={strings.pagination}>
            {query.page > 1 ? (
              <Link rel="prev" href={catalogHref(base, { ...query, page: query.page - 1 })}>
                {strings.previous}
              </Link>
            ) : (
              <span />
            )}
            <span>{strings.pageLabel(query.page, totalPages)}</span>
            {query.page < totalPages ? (
              <Link rel="next" href={catalogHref(base, { ...query, page: query.page + 1 })}>
                {strings.next}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>

      {selected ? (
        <div
          className="impilo-catalog-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedId(null)
          }}
          role="presentation"
        >
          <div
            aria-labelledby="catalog-detail-title"
            aria-modal="true"
            className="impilo-catalog-dialog"
            role="dialog"
          >
            <button
              aria-label={strings.close}
              className="impilo-catalog-dialog__close"
              onClick={() => setSelectedId(null)}
              ref={closeButtonRef}
              type="button"
            >
              <CloseIcon />
            </button>

            <div className="impilo-catalog-dialog__gallery">
              <div className="impilo-catalog-dialog__main-image">
                {currentImage ? (
                  <Image
                    alt={currentImage.alt}
                    height={720}
                    sizes="(max-width: 900px) 90vw, 50vw"
                    src={currentImage.url}
                    unoptimized
                    width={720}
                  />
                ) : null}
              </div>

              {selected.images.length > 1 ? (
                <div className="impilo-catalog-dialog__thumbs">
                  {selected.images.map((image, index) => (
                    <button
                      aria-label={strings.imageLabel(index + 1, selected.images.length)}
                      aria-pressed={index === activeImage}
                      className={`impilo-catalog-dialog__thumb${
                        index === activeImage ? ' is-active' : ''
                      }`}
                      key={image.url}
                      onClick={() => setActiveImage(index)}
                      type="button"
                    >
                      <Image
                        alt=""
                        height={120}
                        loading="lazy"
                        src={image.url}
                        unoptimized
                        width={120}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="impilo-catalog-dialog__info">
              <span className="impilo-catalog-card__category">
                {categoryLabel(selected.category, language)}
              </span>
              <h3 id="catalog-detail-title">{selected.name}</h3>
              <p className="impilo-catalog-dialog__description">{selected.description}</p>

              <dl className="impilo-catalog-dialog__facts">
                <div>
                  <dt>{strings.activeIngredient}</dt>
                  <dd>{selected.activeIngredient}</dd>
                </div>
                <div>
                  <dt>{strings.concentration}</dt>
                  <dd>{selected.concentration}</dd>
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
                <section className="impilo-catalog-dialog__section">
                  <h4>{strings.indications}</h4>
                  <p>{selected.indications}</p>
                </section>
              ) : null}

              {selected.warnings ? (
                <section className="impilo-catalog-dialog__section">
                  <h4>{strings.warnings}</h4>
                  <p>{selected.warnings}</p>
                </section>
              ) : null}

              {selected.prescriptionRequired ? (
                <p className="impilo-catalog-dialog__note">{strings.prescriptionNote}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
