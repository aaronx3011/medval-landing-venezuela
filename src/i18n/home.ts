import type { LanguageCode } from '@/regions'

type HighlightedText = {
  highlighted?: boolean
  text: string
}

type HowItWorksPart = {
  description: string
  icon: string
  number: string
  title: HighlightedText[]
}

type BioStat = {
  label: string
  value: string
}

type Certification = {
  category: string
  description: string
  title: string
}

export type HomeContent = {
  alliances: {
    eyebrow: string
    heading: string
    how: string[]
    howLabel: string
    note: string
    partners: { alt: string; src: string }[]
    partnersLabel: string
    text: string
  }
  bio: {
    heading: string
    image?: string | null
    stats: BioStat[]
    paragraphs: string[]
  }
  certifications: {
    description: string
    heading: string
    items: Certification[]
  }
  cta: {
    button: string
    title: string
  }
  hero: {
    cta: string
    eyebrow: { text: string; slide?: number }[]
    tagline: string
    /** Optional supporting paragraph from the CMS. */
    subtitle?: string | null
    /** Background photography rotates beneath the fixed headline. */
    slides: { image: string }[]
    titleLineOne: string
  }
  howItWorks: HowItWorksPart[]
  integrations: {
    items: { description: string; image?: string | null; showImage?: boolean; title: string }[]
    text: string
    title: string[]
  }
  specialties: {
    closeLabel: string
    description: string
    heading: string
    items: { description: string; title: string }[]
    openLabel: string
    scrollCue: string
  }
}

export const homeContent: Record<LanguageCode, HomeContent> = {
  en: {
    hero: {
      titleLineOne: 'For us, your health is',
      cta: 'Get in touch',
      eyebrow: [
        { text: 'Medicines', slide: 0 },
        { text: ', ' },
        { text: 'equipment', slide: 1 },
        { text: ', and ' },
        { text: 'medical supplies', slide: 2 },
      ],
      tagline: 'our priority',
      slides: [
        {
          image: '/impilo/home/hero/medicines-blue-lab.webp',
        },
        {
          image: '/impilo/home/hero/operating-room.webp',
        },
        {
          image: '/impilo/home/hero/clinical-laboratory.webp',
        },
      ],
    },
    bio: {
      heading: 'About Medval',
      paragraphs: [
        'Based in Miami, Medval Supplies imports, exports, and distributes medicines, medical equipment, and disposable supplies.',
        'We supply clinics, hospitals, and healthcare professionals throughout the Americas and beyond.',
        'We work with manufacturers in Europe and the Americas and develop our own product line.',
      ],
      stats: [
        { value: '15+', label: 'Years of experience' },
        { value: '20+', label: 'Countries supplied' },
        { value: '500+', label: 'Corporations served' },
      ],
    },
    howItWorks: [
      {
        icon: 'IconOne.svg',
        number: '01.',
        title: [{ text: 'Logistics & ' }, { text: 'Cold Chain', highlighted: true }],
        description:
          'Temperature-controlled transport and storage, with monitoring and traceability at every stage.',
      },
      {
        icon: 'IconTwo.svg',
        number: '02.',
        title: [{ text: 'Technical ' }, { text: 'Training', highlighted: true }],
        description:
          'Training for your facility’s staff on the safe and efficient use of medical equipment and supplies.',
      },
      {
        icon: 'IconThree.svg',
        number: '03.',
        title: [{ text: 'Maintenance', highlighted: true }],
        description:
          'Preventive and corrective plans that keep your equipment performing at its best.',
      },
      {
        icon: 'IconFour.svg',
        number: '04.',
        title: [{ text: 'Institutional ' }, { text: 'Supply', highlighted: true }],
        description: 'Continuous, planned supply for clinics, hospitals, and public institutions.',
      },
      {
        icon: 'IconOne.svg',
        number: '05.',
        title: [{ text: 'International ' }, { text: 'Sourcing', highlighted: true }],
        description:
          'Sourcing and consolidation with recognized manufacturers across Europe, North America, and Latin America.',
      },
    ],
    specialties: {
      heading: 'Medical Specialties',
      description: 'Explore the areas of care we supply to clinics and hospitals.',
      openLabel: 'Read more',
      closeLabel: 'Read less',
      scrollCue: 'Continue',
      items: [
        {
          title: 'Oncology',
          description:
            'High-cost oncology and chemotherapy medicines, with special handling and full traceability.',
        },
        {
          title: 'Cardiology',
          description:
            'Solutions for treating cardiovascular disease and comprehensive heart care.',
        },
        {
          title: 'Pulmonology',
          description: 'Treatments for respiratory conditions and respiratory support therapies.',
        },
        {
          title: 'Gastroenterology & Nutrition',
          description: 'Clinical nutrition and treatments for digestive and absorption disorders.',
        },
        {
          title: 'Emergency & Intensive Care',
          description: 'Critical supplies for emergencies and intensive care.',
        },
        {
          title: 'Hemophilia',
          description: 'Clotting factors and specialized treatments for hemophilia patients.',
        },
        {
          title: 'Renal Failure',
          description: 'Dialysis and renal failure solutions for hospitals and clinics.',
        },
      ],
    },
    certifications: {
      heading: 'Certifications',
      description:
        'Ask our team for the documentation relevant to the products and destination of your order.',
      items: [
        {
          category: 'Permits & Licensing',
          title: 'Current documentation on request',
          description:
            'Ask our team for the permits and licenses that apply to your products and destination.',
        },
        {
          category: 'Logistics & Transport',
          title: 'Documented cold chain',
          description:
            'We share the temperature-handling protocols and records for every shipment.',
        },
        {
          category: 'Quality',
          title: 'How we prepare each order',
          description:
            'We walk you through how we prepare, pack, and verify each delivery before it ships.',
        },
      ],
    },
    alliances: {
      eyebrow: 'Connected by a commitment to care',
      heading: 'Alliances',
      text: 'We work with manufacturers and laboratories in Europe and the Americas to supply clinics and hospitals.',
      partners: [
        { alt: 'Pisa Farmacéutica', src: '/logos/pisa.png' },
        { alt: 'Dialife', src: '/logos/dialife.png' },
        { alt: 'Octapharma', src: '/logos/octapharma.svg' },
      ],
      partnersLabel: 'Brands we work with',
      howLabel: 'How we work with partners',
      how: [
        'Direct sourcing with manufacturers in Europe and the Americas',
        'Temperature-controlled logistics with full traceability',
        'Ongoing support for every institution we serve',
      ],
      note: 'Alliance details and success stories are shared upon request.',
    },
    integrations: {
      title: ['Medicines, equipment, and supplies', 'for the people who care.'],
      items: [
        {
          title: 'Pharmaceutical Products',
          description:
            'Medicines for specialized care, with traceability and careful handling at every stage.',
        },
        {
          title: 'Medical Equipment',
          description:
            'Technology for your medical team, backed by training, technical support, and maintenance.',
        },
        {
          title: 'Disposable Supplies',
          description:
            'Essential supplies for everyday care in clinics, hospitals, and healthcare facilities.',
        },
      ],
      text: 'From Miami, we connect your institution with manufacturers in Europe and the Americas. We coordinate orders for specialized care and everyday operations.',
    },
    cta: {
      title:
        'Need medicines, equipment, or supplies for your facility? Tell us what you are looking for.',
      button: 'Let’s talk',
    },
  },
  es: {
    hero: {
      titleLineOne: 'Para nosotros tu salud es',
      cta: 'Contáctanos',
      eyebrow: [
        { text: 'Medicamentos', slide: 0 },
        { text: ', ' },
        { text: 'equipos', slide: 1 },
        { text: ' e ' },
        { text: 'insumos', slide: 2 },
        { text: ' médicos' },
      ],
      tagline: 'nuestra prioridad',
      slides: [
        {
          image: '/impilo/home/hero/medicines-blue-lab.webp',
        },
        {
          image: '/impilo/home/hero/operating-room.webp',
        },
        {
          image: '/impilo/home/hero/clinical-laboratory.webp',
        },
      ],
    },
    bio: {
      heading: 'Sobre Medval',
      paragraphs: [
        'Con sede en Miami, Medval Supplies importa, exporta y distribuye medicamentos, equipos médicos e insumos desechables.',
        'Abastecemos a clínicas, hospitales y profesionales de salud en toda América y más allá.',
        'Trabajamos con fabricantes de Europa y América y desarrollamos una línea propia de productos.',
      ],
      stats: [
        { value: '+15', label: 'Años de trayectoria' },
        { value: '+20', label: 'Países abastecidos' },
        { value: '+500', label: 'Corporaciones atendidas' },
      ],
    },
    howItWorks: [
      {
        icon: 'IconOne.svg',
        number: '01.',
        title: [{ text: 'Logística y ' }, { text: 'Cadena de Frío', highlighted: true }],
        description:
          'Transporte y almacenamiento de productos sensibles a la temperatura, con monitoreo y trazabilidad en cada etapa.',
      },
      {
        icon: 'IconTwo.svg',
        number: '02.',
        title: [{ text: 'Capacitación ' }, { text: 'Técnica', highlighted: true }],
        description:
          'Formación para el personal de tu institución en el uso seguro y eficiente de equipos e insumos médicos.',
      },
      {
        icon: 'IconThree.svg',
        number: '03.',
        title: [{ text: 'Mantenimiento', highlighted: true }],
        description:
          'Planes preventivos y correctivos que mantienen tus equipos operando con el máximo rendimiento.',
      },
      {
        icon: 'IconFour.svg',
        number: '04.',
        title: [{ text: 'Abastecimiento ' }, { text: 'Institucional', highlighted: true }],
        description:
          'Suministro continuo y planificado para clínicas, hospitales y organismos públicos.',
      },
      {
        icon: 'IconOne.svg',
        number: '05.',
        title: [{ text: 'Procura ' }, { text: 'Internacional', highlighted: true }],
        description:
          'Compra y consolidación de productos con fabricantes reconocidos de Europa, Norteamérica y Latinoamérica.',
      },
    ],
    specialties: {
      heading: 'Especialidades Médicas',
      description: 'Conoce las áreas de atención que abastecemos para clínicas y hospitales.',
      openLabel: 'Leer más',
      closeLabel: 'Leer menos',
      scrollCue: 'Continuar',
      items: [
        {
          title: 'Oncología',
          description:
            'Medicamentos oncológicos y de quimioterapia de alto costo, con manejo especial y trazabilidad completa.',
        },
        {
          title: 'Cardiología',
          description:
            'Soluciones para el tratamiento de enfermedades cardiovasculares y el cuidado del corazón.',
        },
        {
          title: 'Neumonología',
          description:
            'Tratamientos para afecciones respiratorias y terapias de soporte respiratorio.',
        },
        {
          title: 'Gastroenterología y Nutrición',
          description:
            'Nutrición clínica y tratamientos para trastornos digestivos y de absorción.',
        },
        {
          title: 'Urgencias y Cuidados Intensivos',
          description: 'Insumos críticos para emergencias y cuidados intensivos.',
        },
        {
          title: 'Hemofilia',
          description:
            'Factores de coagulación y tratamientos especializados para pacientes con hemofilia.',
        },
        {
          title: 'Insuficiencia Renal',
          description: 'Soluciones de diálisis e insuficiencia renal para hospitales y clínicas.',
        },
      ],
    },
    certifications: {
      heading: 'Certificaciones',
      description:
        'Consulta con nuestro equipo la documentación aplicable a los productos y al destino de tu pedido.',
      items: [
        {
          category: 'Permisos y licencias',
          title: 'Documentación vigente a solicitud',
          description:
            'Solicita a nuestro equipo los permisos y licencias que aplican a tus productos y destino.',
        },
        {
          category: 'Logística y transporte',
          title: 'Cadena de frío documentada',
          description:
            'Compartimos los protocolos y registros de manejo de temperatura de cada envío.',
        },
        {
          category: 'Calidad',
          title: 'Cómo preparamos cada pedido',
          description:
            'Te explicamos cómo preparamos, empacamos y verificamos cada entrega antes de despacharla.',
        },
      ],
    },
    alliances: {
      eyebrow: 'Nos une el compromiso de cuidar',
      heading: 'Alianzas',
      text: 'Trabajamos con fabricantes y laboratorios de Europa y América para abastecer a clínicas y hospitales.',
      partners: [
        { alt: 'Pisa Farmacéutica', src: '/logos/pisa.png' },
        { alt: 'Dialife', src: '/logos/dialife.png' },
        { alt: 'Octapharma', src: '/logos/octapharma.svg' },
      ],
      partnersLabel: 'Marcas con las que trabajamos',
      howLabel: 'Cómo trabajamos con aliados',
      how: [
        'Procura directa con fabricantes de Europa y América',
        'Logística con temperatura controlada y trazabilidad',
        'Acompañamiento continuo a cada institución que atendemos',
      ],
      note: 'Los detalles de cada alianza y casos de éxito se comparten al solicitarlos.',
    },
    integrations: {
      title: ['Medicamentos, equipos e insumos', 'para quienes cuidan.'],
      items: [
        {
          title: 'Productos farmacéuticos',
          description:
            'Medicamentos para la atención especializada, con trazabilidad y manejo adecuado en cada etapa.',
        },
        {
          title: 'Equipos médicos',
          description:
            'Tecnología para tu equipo de salud, con capacitación, soporte técnico y mantenimiento.',
        },
        {
          title: 'Suministros desechables',
          description:
            'Insumos esenciales para el cuidado diario en clínicas, hospitales e instituciones de salud.',
        },
      ],
      text: 'Desde Miami, conectamos a tu institución con fabricantes de Europa y América. Coordinamos pedidos para la atención especializada y el trabajo diario.',
    },
    cta: {
      title: '¿Tu institución necesita medicamentos, equipos o insumos? Cuéntanos qué buscas.',
      button: 'Hablemos',
    },
  },
}

export const getHomeContent = (language: LanguageCode): HomeContent => homeContent[language]
