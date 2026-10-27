#!/usr/bin/env node
/**
 * Rebuilds the lab icon set in public/icons from artwork in icons/.
 *
 * - exports hand-drawn icons/<name>.svg verbatim when available
 * - strips the #F5F6F9 background rect every trace ships with
 * - recolors dark paths to currentColor (theming); light fills are cutouts
 *   and keep their color
 * - converts hospital and globe interior fills into transparent even-odd holes
 * - injects `--i` per path (stagger order for the intro)
 * - marks the last dark path `.icona-accent` (details are traced last; it
 *   pops in with overshoot and gets the accent color)
 * - grouped re-exports for icons whose choreography animates inner parts
 *   (paths get `icona-grouped` and bespoke per-icon CSS):
 *     02 #heart / #ecg   — heartbeat + self-writing line
 *     09 #flake          — spinning cargo snowflake
 *     10 #arrow          — trend arrow that draws itself last
 *     11 #gear / #gear-ring / #wrench — only the outer gear rotates
 *
 * Usage: node scripts/build-icons.mjs
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const srcDir = join(root, 'icons')
const outDir = join(root, 'public/icons')

mkdirSync(outDir, { recursive: true })

const inject = (pathTag, index, opts = {}) => {
  const { accent = false, grouped = false } = opts
  // Some traces position their paths via a transform ATTRIBUTE — CSS
  // animations on the path (the accent pop, spins…) would clobber it, so
  // hoist it onto a wrapper <g> and keep the path's own transform clean.
  const ownTransform = pathTag.match(/ transform="([^"]+)"/)?.[1]
  let tag = pathTag.replace(/ transform="[^"]+"/, '')
  const cls = grouped
    ? ['icona-grouped', accent ? 'icona-accent' : ''].filter(Boolean).join(' ')
    : accent
      ? 'icona-accent'
      : ''
  tag = tag.replace(/\/>$/, ` style="--i:${index}"${cls ? ` class="${cls}"` : ''}/>`)
  return ownTransform ? `<g transform="${ownTransform}">${tag}</g>` : tag
}

/** Luminance of a hex fill — light fills are shape cutouts and keep their color. */
const isLightFill = (pathTag) => {
  const fill = pathTag.match(/fill="(#[0-9a-fA-F]{6})"/)?.[1]
  if (!fill) return false
  const r = Number.parseInt(fill.slice(1, 3), 16)
  const g = Number.parseInt(fill.slice(3, 5), 16)
  const b = Number.parseInt(fill.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.82
}

/**
 * Dark paths → currentColor (theming). Light paths are masked layers
 * (interior fills / occlusion pieces): they keep their shade on light
 * contexts via the fallback, and dark sections override --icona-surface to
 * blend them into the background.
 */
const normalizeFill = (pathTag) => {
  const fill = pathTag.match(/fill="(#[0-9a-fA-F]{6})"/i)?.[1]
  if (!fill) return pathTag
  if (!isLightFill(pathTag)) return pathTag.replace(/ fill="(#[0-9a-fA-F]{6})"/gi, '')
  return pathTag.replace(/ fill="(#[0-9a-fA-F]{6})"/i, ` fill="var(--icona-surface, ${fill})"`)
}

/** Turn interior fills into real holes, preserving the silhouette's color and animation. */
const withCutouts = (outline, holes) => {
  const d = [outline, ...holes].map((path) => path.match(/ d="([^"]+)"/)[1]).join(' ')
  return outline.replace(/ d="[^"]+"/, ` d="${d}"`).replace(/\/>$/, ' fill-rule="evenodd"/>')
}

const rebuild = (name) => {
  const num = Number(name.slice(0, 2))
  const artworkPath = join(srcDir, `${name}.svg`)

  if (existsSync(artworkPath)) {
    writeFileSync(join(outDir, `${name}.svg`), readFileSync(artworkPath, 'utf8'))
    console.log(`built ${name}.svg (hand-drawn artwork)`)
    return
  }

  const tracePath = join(srcDir, `Gemini_Generated_Image_jmny33jmny33jmny_${num}.svg`)

  if (!existsSync(tracePath)) {
    console.log(`skip ${name} (no SVG trace)`)
    return
  }

  const raw = readFileSync(tracePath, 'utf8')
  const size = raw.match(/width="([\d.]+)(pt)?".*?height="([\d.]+)(pt)?"/)
  const width = Math.round(Number(size?.[1] ?? 393))
  const height = Math.round(Number(size?.[3] ?? 512))
  const transform = raw.match(/<g transform="([^"]+)"/)?.[1]

  // strip the background rect, normalize fills (dark paths → currentColor,
  // light fills kept as cutouts), then stagger-mark each path
  const paths = [...raw.matchAll(/<path\b[\s\S]*?\/>/g)]
    .map((m) => m[0])
    .filter((p) => !/fill="#F5F6F9"/i.test(p))
    .map(normalizeFill)

  // accent = the last path that isn't a light cutout
  let accentIndex = -1
  for (let i = paths.length - 1; i >= 0; i--) {
    if (!isLightFill(paths[i])) {
      accentIndex = i
      break
    }
  }

  let body

  if (num === 2) {
    // heart: potrace order is [top outline, ECG band, bottom tip]
    body = [
      '<g id="heart">',
      inject(paths[0], 0, { grouped: true }),
      inject(paths[2], 1, { grouped: true }),
      '</g>',
      '<g id="ecg">',
      inject(paths[1], 2, { grouped: true }),
      '</g>',
    ].join('\n')
  } else if (num === 9) {
    // cold-chain truck: the LAST path is the snowflake — grouped so it can
    // spin on the cargo box; the flake is the accent
    body = [
      inject(paths[0], 0),
      '<g id="flake">',
      inject(paths[1], 1, { grouped: true, accent: true }),
      '</g>',
    ].join('\n')
  } else if (num === 10) {
    // presenter: path 3 is the trend arrow — grouped so it can draw itself
    // (left→right) after the rest of the icon assembles; the arrow is the
    // accent, the rest stay currentColor
    const rest = paths.filter((_, i) => i !== 3)
    body = [
      ...rest.map((p, i) => inject(p, i)),
      '<g id="arrow">',
      inject(paths[3], rest.length, { grouped: true, accent: true }),
      '</g>',
    ].join('\n')
  } else if (num === 12) {
    // gear medtools: p0 (light gear fill cutout) + p1 (gear outline) are the
    // back gear; the rest are the crossed tools in front — only the gear
    // rotates. Colors inverted: the gear stays currentColor, the dark tool
    // paths are the accents (light cutouts keep their color)
    body = [
      '<g id="gear">',
      inject(paths[0], 0, { grouped: true }),
      inject(paths[1], 1, { grouped: true }),
      '</g>',
      ...paths.slice(2).map((p, i) => inject(p, 2 + i, { grouped: true, accent: !isLightFill(p) })),
    ].join('\n')
  } else if (num === 13) {
    // Painted interiors hide the glow behind the hospital and boxes, even
    // when they match --icona-surface. Merge them into their silhouettes as
    // even-odd holes so they are genuinely transparent. Keep the cross in
    // currentColor and discard p28's shaded trace fragment.
    const cutouts = new Map([
      [0, [2, 3]], // left wing and medical sign
      [1, [4, 5, 6, 7, 8, 9, 15, 19, 23, 25, 26]], // box faces and lids
      [10, [24]], // upper-right window
      [11, [21]], // lower-left window
      [12, [22]], // upper-left window
    ])
    const cutoutIndices = new Set([...cutouts.values()].flat())

    body = paths
      .map((path, index) => {
        const holes = cutouts.get(index)
        if (!holes) return path

        return withCutouts(
          path,
          holes.map((i) => paths[i]),
        )
      })
      .filter((_, i) => i !== 28 && !cutoutIndices.has(i))
      .map((p, i) => inject(p, i))
      .join('\n')
  } else if (num === 14) {
    // globe plane: p0/p1 = the globe's dark disc, p2 = the plane. p3-p10
    // become transparent grid-panel holes — EXCEPT p6, a light "ghost"
    // plane baked into the art (the second airplane) — dropped. Replace
    // p11-p27's irregular trace fragments with uniform circular route dots.
    // Choreography: the globe assembles, the plane flies
    // the route from the left to its position, and each dot pops exactly
    // when the plane passes it. To keep the trail even and gapless the dots
    // are placed at even arc-length slots along a quadratic Bézier curve:
    // M -50,315 Q 75,425 235,221. Keep icona-plane-fly in
    // icon-animations.css in sync; the end is the plane's natural center.
    const pointOnCurve = (phi) => ({
      x: -50 + 250 * phi + 35 * phi ** 2,
      y: 315 + 220 * phi - 314 * phi ** 2,
      phi,
    })
    // Sample only the visible trail, leaving space behind the plane's tail.
    const curve = Array.from({ length: 201 }, (_, i) => pointOnCurve(0.22 + (i / 200) * 0.64))
    const lengths = curve
      .slice(1)
      .map((point, i) => Math.hypot(point.x - curve[i].x, point.y - curve[i].y))
    const trailLength = lengths.reduce((sum, length) => sum + length, 0)
    const pointAt = (distance) => {
      let segment = 0
      while (segment < lengths.length - 1 && distance > lengths[segment]) {
        distance -= lengths[segment++]
      }
      const t = distance / lengths[segment]
      return pointOnCurve(curve[segment].phi + (curve[segment + 1].phi - curve[segment].phi) * t)
    }

    const dotCount = 14
    const radius = 4.5
    const dot = `<path d="M${-radius},0a${radius},${radius} 0 1,0 ${radius * 2},0a${radius},${radius} 0 1,0 ${-radius * 2},0Z"/>`

    const globe = [
      withCutouts(
        paths[0],
        [3, 5, 8, 10].map((i) => paths[i]),
      ),
      withCutouts(
        paths[1],
        [4, 7, 9].map((i) => paths[i]),
      ),
    ]

    body = [
      '<g id="globe">',
      ...globe.map((path, i) => inject(path, i, { grouped: true })),
      '</g>',
      '<g id="plane">',
      inject(paths[2], 0, { grouped: true }),
      '</g>',
      '<g id="route">',
      ...Array.from({ length: dotCount }, (_, k) => {
        const { x, y, phi } = pointAt((k * trailLength) / (dotCount - 1))
        return [
          `<g transform="translate(${x.toFixed(2)},${y.toFixed(2)})" style="--phi:${phi.toFixed(4)}">`,
          inject(dot, k, { grouped: true, accent: true }),
          '</g>',
        ].join('\n')
      }),
      '</g>',
    ].join('\n')
  } else {
    body = paths.map((p, i) => inject(p, i, { accent: i === accentIndex })).join('\n')
  }

  const svg = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
<g${transform ? ` transform="${transform}"` : ''} fill="currentColor" stroke="none">
${body}
</g>
</svg>
`

  writeFileSync(join(outDir, `${name}.svg`), svg)
  console.log(`built ${name}.svg (${paths.length} paths)`)
}

const specs = readdirSync(srcDir)
  .filter((file) => /^\d+-.*\.md$/.test(file))
  .sort()

specs.forEach((spec) => rebuild(spec.replace(/\.md$/, '')))
