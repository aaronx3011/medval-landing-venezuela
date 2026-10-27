'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

const subscribeReduce = (callback: () => void) => {
  const query = window.matchMedia(REDUCE_QUERY)
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

const getReduce = () => window.matchMedia(REDUCE_QUERY).matches

const getReduceServer = () => false

/**
 * Plays the intro / stay / out choreography specified in `icons/<nn>-*.md`.
 * Fill-safe only (the traced SVGs have no strokes or groups yet): wipes,
 * transforms, opacity and fx overlays — see icon-animations.css.
 *
 * Phases: static (pre-reveal) → in (intro) → stay (loop) → out (exit).
 * The replay button runs the out phase and re-enters, so all three phases
 * are demoable in place.
 */

const INTRO_MS: Record<string, number> = {
  '01': 700,
  '02': 900,
  '03': 450,
  '04': 450,
  '05': 400,
  '06': 450,
  '07': 450,
  '09': 500,
  '10': 350,
  '11': 450,
  '12': 450,
  '13': 400,
  '14': 450,
  '15': 400,
  '16': 450,
  '17': 450,
  '18': 400,
  '19': 450,
  '20': 350,
  '21': 700,
}

const OUT_MS: Record<string, number> = {
  '01': 300,
  '02': 350,
  '03': 300,
  '04': 350,
  '05': 300,
  '06': 350,
  '07': 300,
  '09': 400,
  '10': 350,
  '11': 350,
  '12': 350,
  '13': 350,
  '14': 400,
  '15': 350,
  '16': 350,
  '17': 300,
  '18': 350,
  '19': 350,
  '20': 350,
  '21': 400,
}

type Phase = 'static' | 'in' | 'stay' | 'out'

type AnimatedIconProps = {
  /** Lab only: the ↻ replay button + the phase pill. */
  controls?: boolean
  forceMotion?: boolean
  /** Overrides the per-spec intro duration (used by computed stagger timings). */
  introMs?: number
  label: string
  /** Lab only: bumps to replay every icon in a staggered wave. */
  replayToken?: number
  size?: number
  spec: string
  /** Delay between path reveals in the self-assembly intro. */
  staggerStep?: number
  /** Lab only: this icon's slot in the replay wave. */
  staggerMs?: number
  src: string
  /** Inline SVG markup (grouped re-export) — lets CSS animate inner groups. */
  svgMarkup?: string
}

export const AnimatedIcon = ({
  controls = false,
  forceMotion = false,
  introMs,
  label,
  replayToken = 0,
  size = 96,
  spec,
  staggerStep,
  staggerMs = 0,
  src,
  svgMarkup,
}: AnimatedIconProps) => {
  const [phase, setPhase] = useState<Phase>('static')
  const systemReduced = useSyncExternalStore(subscribeReduce, getReduce, getReduceServer)
  const reduced = systemReduced && !forceMotion
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          setPhase((current) => (current === 'static' ? 'in' : current))
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (phase === 'in') {
      const timer = window.setTimeout(
        () => setPhase('stay'),
        reduced ? 200 : (introMs ?? INTRO_MS[spec] ?? 450),
      )
      return () => window.clearTimeout(timer)
    }

    if (phase === 'out') {
      const timer = window.setTimeout(() => setPhase('in'), reduced ? 200 : (OUT_MS[spec] ?? 350))
      return () => window.clearTimeout(timer)
    }
  }, [phase, reduced, spec, introMs])

  // "Reproducir todo": the parent bumps the token; each card exits and
  // re-enters after its stagger slot.
  useEffect(() => {
    if (replayToken === 0) return

    const timer = window.setTimeout(
      () => setPhase((current) => (current === 'static' ? current : 'out')),
      staggerMs,
    )

    return () => window.clearTimeout(timer)
  }, [replayToken, staggerMs])

  const stageClass = [
    'icona-stage',
    `icona-${spec}`,
    phase === 'in' ? 'is-in' : '',
    phase === 'stay' ? 'is-stay' : '',
    phase === 'out' ? 'is-out' : '',
    reduced ? 'is-reduce' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="icona" ref={ref}>
      <div
        className={stageClass}
        style={
          {
            '--icona-size': `${size}px`,
            '--icona-step': `${staggerStep ?? 90}ms`,
            '--icona-intro': `${introMs ?? INTRO_MS[spec] ?? 450}ms`,
          } as React.CSSProperties
        }
      >
        {svgMarkup ? (
          <div
            aria-label={label}
            className="icona-inline"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
            role="img"
          />
        ) : (
          <Image alt={label} height={size} src={src} unoptimized width={size} />
        )}
        <span aria-hidden="true" className="icona-fx icona-fx-main" />
        <span aria-hidden="true" className="icona-fx icona-fx-snow" />
        <span aria-hidden="true" className="icona-fx icona-fx-snow2" />
      </div>
      {controls ? (
        <>
          <button
            aria-label={`Replay ${label}`}
            className="icona-replay"
            disabled={phase === 'out' || phase === 'static'}
            onClick={() => setPhase('out')}
            type="button"
          >
            ↻
          </button>
          <span className="icona-phase" data-phase={phase}>
            {phase === 'static' ? '—' : phase}
          </span>
        </>
      ) : null}
    </div>
  )
}
