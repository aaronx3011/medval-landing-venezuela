'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

import { getCatalogStrings } from '@/i18n/catalog'
import {
  categoryLabel,
  catalogCategoryOrder,
  searchCatalogItems,
  type CatalogCategory,
  type CatalogItemView,
} from '@/lib/catalog'
import type { LanguageCode } from '@/regions'

type CatalogSectionProps = {
  items: CatalogItemView[]
  language: LanguageCode
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

export const CatalogSection = ({ items, language }: CatalogSectionProps) => {
  const strings = getCatalogStrings(language)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CatalogCategory | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const categories = useMemo(
    () => catalogCategoryOrder.filter((value) => items.some((item) => item.category === value)),
    [items],
  )

  const results = useMemo(
    () => searchCatalogItems(items, query, category, language),
    [items, query, category, language],
  )

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

  const clearFilters = () => {
    setQuery('')
    setCategory('all')
  }

  const currentImage = selected?.images[activeImage] ?? selected?.images[0] ?? null

  return (
    <section aria-labelledby="catalog-heading" className="impilo-catalog" id="catalogo">
      <div className="impilo-catalog__inner">
        <span className="impilo-catalog__eyebrow">{strings.catalogEyebrow}</span>
        <h2 id="catalog-heading">{strings.heading}</h2>
        <p className="impilo-catalog__lead">{strings.lead}</p>

        <div className="impilo-catalog__search">
          <span aria-hidden="true" className="impilo-catalog__search-icon">
            <SearchIcon />
          </span>
          <label className="impilo-visually-hidden" htmlFor="catalog-search">
            {strings.searchLabel}
          </label>
          <input
            autoComplete="off"
            id="catalog-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={strings.searchPlaceholder}
            type="search"
            value={query}
          />
          {query ? (
            <button
              aria-label={strings.clearSearch}
              className="impilo-catalog__clear"
              onClick={() => setQuery('')}
              type="button"
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>

        {categories.length > 1 ? (
          <div aria-label={strings.filterLabel} className="impilo-catalog__filters" role="group">
            <button
              aria-pressed={category === 'all'}
              className={`impilo-catalog__chip${category === 'all' ? ' is-active' : ''}`}
              onClick={() => setCategory('all')}
              type="button"
            >
              {strings.allCategories}
            </button>
            {categories.map((value) => (
              <button
                aria-pressed={category === value}
                className={`impilo-catalog__chip${category === value ? ' is-active' : ''}`}
                key={value}
                onClick={() => setCategory(value)}
                type="button"
              >
                {categoryLabel(value, language)}
              </button>
            ))}
          </div>
        ) : null}

        <p aria-live="polite" className="impilo-catalog__count">
          {strings.results(results.length)}
        </p>

        {results.length > 0 ? (
          <ul className="impilo-catalog__grid">
            {results.map((item) => {
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
            <h3>{items.length === 0 ? strings.emptyTitle : strings.noResultsTitle}</h3>
            <p>{items.length === 0 ? strings.emptyBody : strings.noResultsBody}</p>
            {items.length > 0 ? (
              <button className="impilo-catalog__reset" onClick={clearFilters} type="button">
                {strings.clearFilters}
              </button>
            ) : null}
          </div>
        )}
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
    </section>
  )
}
