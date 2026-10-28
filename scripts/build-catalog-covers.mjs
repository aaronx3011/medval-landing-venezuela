import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

// Art-directed crops of the four supplied pack shots. Keep original uploads
// intact for label reading in the gallery; covers just remove excess whitespace.
const covers = [
  {
    source: 'A.M.K Fondo Blanco (2).jpg',
    name: 'amk',
    crop: { left: 150, top: 330, width: 720, height: 360 },
  },
  {
    source: 'Agua Inyectable Fondo Blanco (1).jpg',
    name: 'agua',
    crop: { left: 240, top: 60, width: 500, height: 920 },
  },
  {
    source: 'Albumina Fondo blanco  (3).jpg',
    name: 'albumina',
    crop: { left: 190, top: 50, width: 630, height: 900 },
  },
  {
    source: 'Alnex Fondo Blanco (1).jpg',
    name: 'alnex',
    referenceWidth: 2000,
    crop: { left: 710, top: 390, width: 600, height: 730 },
  },
]

const destination = path.resolve('public/catalog-covers')
await fs.mkdir(destination, { recursive: true })
for (const cover of covers) {
  const source = path.resolve('seed-assets/catalog', cover.source)
  const metadata = await sharp(source).metadata()
  const scale = metadata.width / (cover.referenceWidth ?? 1000)
  const crop = Object.fromEntries(
    Object.entries(cover.crop).map(([key, value]) => [key, Math.round(value * scale)]),
  )
  await sharp(source)
    .extract(crop)
    .resize(640, 640, { fit: 'contain', background: '#fff' })
    .extend({ top: 40, bottom: 40, left: 40, right: 40, background: '#fff' })
    .webp({ quality: 88 })
    .toFile(path.join(destination, `${cover.name}.webp`))
  console.log(`Catalog cover: ${cover.name}.webp`)
}
