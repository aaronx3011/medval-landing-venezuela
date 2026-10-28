import fs from 'node:fs/promises'
import path from 'node:path'

import type { Payload, PayloadRequest } from 'payload'
import sharp from 'sharp'

import type { CatalogItem, Media } from '../payload-types.js'

const catalogDir = () =>
  path.resolve(
    process.cwd(),
    process.env.NODE_ENV === 'production' ? 'catalog-import' : 'seed-assets/catalog',
  )

type Localized = {
  en: string
  es: string
}

type SeedImage = {
  alt: Localized
  file: string
  filename: string
}

type SeedCatalogItem = {
  activeIngredient: Localized
  category: CatalogItem['category']
  concentration: string
  description: Localized
  images: SeedImage[]
  indications: Localized
  keywords: Localized
  laboratory: string
  name: Localized
  pharmaceuticalForm: Localized
  presentation: Localized
  prescriptionRequired: boolean
  registrationNumber?: string
  slug: string
  warnings: Localized
}

const image = (file: string, filename: string, altEs: string, altEn: string): SeedImage => ({
  file,
  filename,
  alt: { es: altEs, en: altEn },
})

export const suppliedCatalogItems: SeedCatalogItem[] = [
  {
    slug: 'a-m-k-amikacina-500-mg-2-ml',
    category: 'antibiotico',
    name: {
      es: 'A.M.K. (Amikacina) 500 mg/2 mL',
      en: 'A.M.K. (Amikacin) 500 mg/2 mL',
    },
    activeIngredient: {
      es: 'Sulfato de amikacina equivalente a 500 mg de amikacina',
      en: 'Amikacin sulfate equivalent to 500 mg amikacin',
    },
    concentration: '500 mg / 2 mL',
    pharmaceuticalForm: {
      es: 'Solución inyectable',
      en: 'Solution for injection',
    },
    presentation: {
      es: 'Caja con 1 ampolleta de 2 mL',
      en: 'Box with 1 ampoule of 2 mL',
    },
    laboratory: 'PISA',
    registrationNumber: 'Reg. No. 249M87 SSA IV',
    description: {
      es: 'Antibiótico inyectable de la familia de los aminoglucósidos, presentado en ampolletas de 2 mL para uso institucional.',
      en: 'Injectable aminoglycoside antibiotic supplied in 2 mL ampoules for institutional use.',
    },
    indications: {
      es: 'Tratamiento de infecciones bacterianas sensibles a la amikacina, según prescripción y criterio médico.',
      en: 'Treatment of bacterial infections susceptible to amikacin, as prescribed by a physician.',
    },
    warnings: {
      es: 'Venta bajo prescripción facultativa. Uso hospitalario. No usar si la solución está turbia o contiene partículas. Vía intramuscular o intravenosa, según indicación médica.',
      en: 'Prescription only. Hospital use. Do not use if the solution is cloudy or contains particles. Intramuscular or intravenous route, as directed by a physician.',
    },
    keywords: {
      es: 'amikacina, amikacin, A.M.K, antibiótico, aminoglucósido, infección, PISA',
      en: 'amikacin, A.M.K, antibiotic, aminoglycoside, infection, PISA',
    },
    prescriptionRequired: true,
    images: [
      image(
        'A.M.K Fondo Blanco (2).jpg',
        'catalog-amk-01.jpg',
        'Caja de A.M.K. amikacina 500 mg/2 mL',
        'A.M.K. amikacin 500 mg/2 mL box',
      ),
      image(
        'A.M.K Fondo Blanco (3).jpg',
        'catalog-amk-02.jpg',
        'Caja de A.M.K. amikacina vista en ángulo',
        'A.M.K. amikacin box seen at an angle',
      ),
      image(
        'A.M.K Fondo Blanco (1).jpg',
        'catalog-amk-03.jpg',
        'Ampolleta de A.M.K. amikacina 500 mg/2 mL',
        'A.M.K. amikacin 500 mg/2 mL ampoule',
      ),
      image(
        'A.M.K Fondo Blanco (4).jpg',
        'catalog-amk-04.jpg',
        'Empaque de A.M.K. amikacina 500 mg/2 mL',
        'A.M.K. amikacin 500 mg/2 mL packaging',
      ),
      image(
        'A.M.K Fondo Blanco (5).jpg',
        'catalog-amk-05.jpg',
        'Empaque y ampolleta de A.M.K. amikacina',
        'A.M.K. amikacin packaging and ampoule',
      ),
    ],
  },
  {
    slug: 'agua-inyectable-pisa-500-ml',
    category: 'diluyente',
    name: {
      es: 'Agua Inyectable PISA 500 mL',
      en: 'PISA Injectable Water 500 mL',
    },
    activeIngredient: {
      es: 'Agua estéril para uso inyectable',
      en: 'Sterile water for injection',
    },
    concentration: '500 mL',
    pharmaceuticalForm: {
      es: 'Solución estéril',
      en: 'Sterile solution',
    },
    presentation: {
      es: 'Frasco con 500 mL',
      en: '500 mL bottle',
    },
    laboratory: 'PISA',
    description: {
      es: 'Agua estéril para uso inyectable en frasco de 500 mL, empleada para irrigación según indicación del profesional de la salud.',
      en: 'Sterile water for injection in a 500 mL bottle, used for irrigation as directed by a healthcare professional.',
    },
    indications: {
      es: 'Irrigación según indicación del profesional de la salud. Consulta el prospecto antes de su uso.',
      en: 'Irrigation as directed by a healthcare professional. Read the package insert before use.',
    },
    warnings: {
      es: 'Su administración intravenosa directa produce hemólisis. Uso exclusivo en irrigación. No usar si el líquido está turbio o contiene partículas.',
      en: 'Direct intravenous administration causes hemolysis. For irrigation use only. Do not use if the liquid is cloudy or contains particles.',
    },
    keywords: {
      es: 'agua inyectable, agua estéril, irrigación, diluyente, PISA, solución',
      en: 'injectable water, sterile water, irrigation, diluent, PISA, solution',
    },
    prescriptionRequired: true,
    images: [
      image(
        'Agua Inyectable Fondo Blanco (1).jpg',
        'catalog-agua-01.jpg',
        'Frasco de Agua Inyectable PISA de 500 mL',
        'PISA 500 mL injectable water bottle',
      ),
      image(
        'Agua Inyectable Fondo Blanco (2).jpg',
        'catalog-agua-02.jpg',
        'Etiqueta lateral del Agua Inyectable PISA',
        'Side label of PISA injectable water',
      ),
      image(
        'Agua Inyectable Fondo Blanco (3).jpg',
        'catalog-agua-03.jpg',
        'Frasco de Agua Inyectable PISA visto en ángulo',
        'PISA injectable water bottle seen at an angle',
      ),
      image(
        'Agua inyectable SIN FONDO (1).png',
        'catalog-agua-04.png',
        'Agua Inyectable PISA 500 mL sin fondo',
        'PISA 500 mL injectable water on a transparent background',
      ),
      image(
        'Agua inyectable SIN FONDO (2).png',
        'catalog-agua-05.png',
        'Frasco de Agua Inyectable PISA sin fondo',
        'PISA injectable water bottle on a transparent background',
      ),
    ],
  },
  {
    slug: 'albumina-humana-20-octapharma-50-ml',
    category: 'derivado-plasma',
    name: {
      es: 'Albúmina Humana 20 % Octapharma 50 mL',
      en: 'Human Albumin 20% Octapharma 50 mL',
    },
    activeIngredient: {
      es: 'Albúmina humana 20 g por cada 100 mL',
      en: 'Human albumin 20 g per 100 mL',
    },
    concentration: '20 % (200 g/L) · 50 mL',
    pharmaceuticalForm: {
      es: 'Solución para infusión intravenosa',
      en: 'Solution for intravenous infusion',
    },
    presentation: {
      es: 'Frasco ampolla de 50 mL',
      en: '50 mL infusion bottle',
    },
    laboratory: 'Octapharma',
    registrationNumber: 'P.B. 905/19 · CPE 0923543566',
    description: {
      es: 'Solución de albúmina humana al 20 % para infusión intravenosa, de uso hospitalario y bajo prescripción facultativa.',
      en: '20% human albumin solution for intravenous infusion, for hospital use and under medical prescription.',
    },
    indications: {
      es: 'Indicaciones y posología a juicio del facultativo. Consulta siempre el prospecto adjunto.',
      en: 'Indications and dosage at the physician’s discretion. Always read the enclosed package insert.',
    },
    warnings: {
      es: 'Uso hospitalario. Venta bajo prescripción facultativa. No congelar. No almacenar a temperatura superior a 25 °C. No usar si el sello está roto, la solución está turbia o presenta partículas.',
      en: 'Hospital use. Prescription only. Do not freeze. Do not store above 25 °C. Do not use if the seal is broken, the solution is cloudy, or particles are present.',
    },
    keywords: {
      es: 'albúmina, albumina humana, plasma, expansor, Octapharma, infusión, hospitalario',
      en: 'albumin, human albumin, plasma, expander, Octapharma, infusion, hospital',
    },
    prescriptionRequired: true,
    images: [
      image(
        'Albumina Fondo blanco  (3).jpg',
        'catalog-albumina-01.jpg',
        'Caja de Albúmina Humana 20 % Octapharma de 50 mL',
        'Octapharma Human Albumin 20% 50 mL box',
      ),
      image(
        'Albumina Fondo blanco  (4).jpg',
        'catalog-albumina-02.jpg',
        'Caja de Albúmina Humana 20 % vista en ángulo',
        'Human Albumin 20% box seen at an angle',
      ),
      image(
        'Albumina Fondo blanco  (1).jpg',
        'catalog-albumina-03.jpg',
        'Reverso en español de la caja de Albúmina Humana 20 %',
        'Spanish back label of the Human Albumin 20% box',
      ),
      image(
        'Albumina Fondo blanco  (2).jpg',
        'catalog-albumina-04.jpg',
        'Reverso en inglés de la caja de Albúmina Humana 20 %',
        'English back label of the Human Albumin 20% box',
      ),
      image(
        'Albumina Octapharma SIN FONDO  (1).png',
        'catalog-albumina-05.png',
        'Reverso de la caja de Albúmina Octapharma sin fondo',
        'Octapharma albumin box back on a transparent background',
      ),
      image(
        'Albumina Octapharma SIN FONDO  (2).png',
        'catalog-albumina-06.png',
        'Frente de la caja de Albúmina Octapharma sin fondo',
        'Octapharma albumin box front on a transparent background',
      ),
      image(
        'Albumina Octapharma SIN FONDO  (4).png',
        'catalog-albumina-07.png',
        'Caja de Albúmina Octapharma en ángulo sin fondo',
        'Octapharma albumin box at an angle on a transparent background',
      ),
      image(
        'Albumina Octapharma SIN FONDO  (5).png',
        'catalog-albumina-08.png',
        'Caja de Albúmina Octapharma 20 % sin fondo',
        'Octapharma Human Albumin 20% box on a transparent background',
      ),
    ],
  },
  {
    slug: 'alnex-metamizol-sodico',
    category: 'analgesico',
    name: {
      es: 'Alnex (Metamizol Sódico)',
      en: 'Alnex (Metamizole Sodium)',
    },
    activeIngredient: {
      es: 'Metamizol sódico',
      en: 'Metamizole sodium',
    },
    concentration: '1 g / 2 mL · 2.5 g / 5 mL',
    pharmaceuticalForm: {
      es: 'Solución inyectable',
      en: 'Solution for injection',
    },
    presentation: {
      es: 'Caja con 3 ampolletas de 2 mL · Caja con 50 ampolletas de 5 mL',
      en: 'Box with 3 × 2 mL ampoules · Box with 50 × 5 mL ampoules',
    },
    laboratory: 'PISA',
    description: {
      es: 'Analgésico y antipirético inyectable de uso institucional, disponible en ampolletas de 2 mL y de 5 mL.',
      en: 'Injectable analgesic and antipyretic for institutional use, available in 2 mL and 5 mL ampoules.',
    },
    indications: {
      es: 'Alivio del dolor y reducción de la fiebre, según prescripción y vigilancia médica.',
      en: 'Relief of pain and reduction of fever, under medical prescription and supervision.',
    },
    warnings: {
      es: 'Medicamento de alto riesgo. Uso solo por prescripción y bajo vigilancia médica. Vía intramuscular o intravenosa. No usar durante el embarazo o la lactancia sin indicación médica.',
      en: 'High-risk medication. Prescription only, under medical supervision. Intramuscular or intravenous route. Do not use during pregnancy or breastfeeding without medical advice.',
    },
    keywords: {
      es: 'Alnex, metamizol, metamizol sódico, dipirona, analgésico, antipirético, dolor, fiebre, PISA',
      en: 'Alnex, metamizole, metamizole sodium, dipyrone, analgesic, antipyretic, pain, fever, PISA',
    },
    prescriptionRequired: true,
    images: [
      image(
        'Alnex Fondo Blanco (1).jpg',
        'catalog-alnex-01.jpg',
        'Caja de Alnex metamizol sódico 1 g/2 mL',
        'Alnex metamizole sodium 1 g/2 mL box',
      ),
      image(
        'Alnex Fondo Blanco (2).jpg',
        'catalog-alnex-02.jpg',
        'Caja y ampolletas de Alnex 1 g/2 mL',
        'Alnex 1 g/2 mL box and ampoules',
      ),
      image(
        'Alnex fondo blanco.jpg',
        'catalog-alnex-03.jpg',
        'Caja y ampolletas de Alnex 2.5 g/5 mL',
        'Alnex 2.5 g/5 mL box and ampoules',
      ),
    ],
  },
]

const findMedia = async (
  payload: Payload,
  filename: string,
  req?: PayloadRequest,
): Promise<Media | null> => {
  const { docs } = await payload.find({
    collection: 'media',
    req,
    where: { filename: { equals: filename } },
    limit: 1,
  })

  return docs[0] ?? null
}

const ensureImage = async (
  payload: Payload,
  entry: SeedImage,
  req?: PayloadRequest,
): Promise<Media> => {
  const existing = await findMedia(payload, entry.filename, req)

  if (existing) {
    return existing
  }

  const source = path.join(catalogDir(), entry.file)
  const original = await fs.readFile(source)
  const extension = path.extname(entry.filename).toLowerCase()
  const pipeline = sharp(original)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })

  const data =
    extension === '.png'
      ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
      : await pipeline.jpeg({ mozjpeg: true, quality: 86 }).toBuffer()
  const mimetype = extension === '.png' ? 'image/png' : 'image/jpeg'

  const created = await payload.create({
    collection: 'media',
    req,
    locale: 'es',
    data: { alt: entry.alt.es },
    file: {
      name: entry.filename,
      data,
      mimetype,
      size: data.length,
    },
  })

  await payload.update({
    collection: 'media',
    req,
    id: created.id,
    locale: 'en',
    data: { alt: entry.alt.en },
  })

  return created
}

const localizedFields = (item: SeedCatalogItem, language: keyof Localized) => ({
  activeIngredient: item.activeIngredient[language],
  description: item.description[language],
  indications: item.indications[language],
  keywords: item.keywords[language],
  name: item.name[language],
  pharmaceuticalForm: item.pharmaceuticalForm[language],
  presentation: item.presentation[language],
  warnings: item.warnings[language],
})

const createCatalogItem = async (
  payload: Payload,
  item: SeedCatalogItem,
  images: Media[],
  req?: PayloadRequest,
) => {
  const base = {
    category: item.category,
    concentration: item.concentration,
    laboratory: item.laboratory,
    prescriptionRequired: item.prescriptionRequired,
    published: true,
    registrationNumber: item.registrationNumber,
    slug: item.slug,
    images: images.map((media) => ({ image: media.id })),
  }

  const created = await payload.create({
    collection: 'catalog-items',
    req,
    locale: 'es',
    data: { ...base, ...localizedFields(item, 'es') },
  })

  await payload.update({
    collection: 'catalog-items',
    req,
    id: created.id,
    locale: 'en',
    data: localizedFields(item, 'en'),
  })
}

/** Catalog-only content import. Never modifies existing products, globals or users. */
export const importSuppliedCatalog = async (
  payload: Payload,
  { items = suppliedCatalogItems, req }: { items?: SeedCatalogItem[]; req?: PayloadRequest } = {},
) => {
  let created = 0
  let skipped = 0
  for (const item of items) {
    const { docs } = await payload.find({
      collection: 'catalog-items',
      where: { slug: { equals: item.slug } },
      limit: 1,
      req,
    })
    if (docs.length) {
      skipped += 1
      continue
    }
    const images: Media[] = []

    for (const entry of item.images) {
      images.push(await ensureImage(payload, entry, req))
    }

    await createCatalogItem(payload, item, images, req)
    created += 1
  }

  payload.logger.info(
    `Catálogo: ${created} productos importados, ${skipped} existentes conservados.`,
  )
  return { created, skipped }
}
