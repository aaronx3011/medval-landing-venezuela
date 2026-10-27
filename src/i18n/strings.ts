import type { SectionId } from '@/components/sections'
import { isLanguageCode, type LanguageCode } from '@/regions'

export type UIStrings = {
  navSections: string
  openMenu: string
  closeMenu: string
  mobileMenu: string
  sectionLabels: Record<SectionId, string>
  regionSwitcher: string
  languageToggle: string
  form: {
    honeypot: string
    name: string
    email: string
    phone: string
    region: string
    message: string
    namePlaceholder: string
    emailPlaceholder: string
    phonePlaceholder: string
    messagePlaceholder: string
    optional: string
    privacyNote: string
    sendContact: string
    sending: string
    contactSuccess: string
    error: string
    rateLimited: string
  }
  validation: {
    name: string
    email: string
    phone: string
    region: string
    message: string
  }
  whatsapp: {
    aria: string
    defaultMessage: string
  }
  contact: {
    whatsapp: string
    heading: string
    headingAccent: string
    lead: string
    formEyebrow: string
    formHeading: string
    formDescription: string
  }
  homeCtaFallback: string
  social: string
}

export const uiStrings: Record<LanguageCode, UIStrings> = {
  es: {
    navSections: 'Secciones',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    mobileMenu: 'Menú móvil',
    sectionLabels: {
      inicio: 'Inicio',
      'sobre-medval': 'Sobre Medval',
      especialidades: 'Especialidades',
      catalogo: 'Catálogo',
      servicios: 'Servicios',
      certificaciones: 'Certificaciones',
      alianzas: 'Alianzas',
      contacto: 'Contacto',
    },
    regionSwitcher: 'Selecciona tu región',
    languageToggle: 'Idioma',
    form: {
      honeypot: 'No llenar este campo',
      name: 'Nombre',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      region: 'Región',
      message: 'Mensaje',
      namePlaceholder: 'Tu nombre completo',
      emailPlaceholder: 'nombre@empresa.com',
      phonePlaceholder: 'Tu número de contacto',
      messagePlaceholder: 'Cuéntanos qué productos, equipos o servicios necesita tu organización…',
      optional: 'opcional',
      privacyNote: 'Usaremos tus datos para dar seguimiento a tu consulta.',
      sendContact: 'Enviar mensaje',
      sending: 'Enviando…',
      contactSuccess: '¡Gracias! Tu mensaje fue enviado. Te responderemos muy pronto.',
      error: 'Revisa los campos marcados e intenta de nuevo.',
      rateLimited: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.',
    },
    validation: {
      name: 'Ingresa tu nombre completo.',
      email: 'Ingresa un correo electrónico válido.',
      phone: 'Ingresa un teléfono válido.',
      region: 'Selecciona una región.',
      message: 'Cuéntanos un poco más (mínimo 10 caracteres).',
    },
    whatsapp: {
      aria: 'Escríbenos por WhatsApp',
      defaultMessage: 'Hola Medval Supplies, me gustaría recibir más información.',
    },
    contact: {
      whatsapp: 'WhatsApp',
      heading: 'Cuéntanos qué necesita',
      headingAccent: 'tu institución.',
      lead: 'Cuéntanos qué medicamentos, equipos o insumos necesita tu institución y en qué país operas.',
      formEyebrow: 'Hablemos de lo que necesitas',
      formHeading: 'Estamos para ayudarte.',
      formDescription: 'Déjanos un mensaje. Juntos encontraremos la solución para tu organización.',
    },
    homeCtaFallback: 'Conócenos',
    social: 'Redes sociales',
  },
  en: {
    navSections: 'Sections',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mobileMenu: 'Mobile menu',
    sectionLabels: {
      inicio: 'Home',
      'sobre-medval': 'About Medval',
      especialidades: 'Specialties',
      catalogo: 'Catalog',
      servicios: 'Services',
      certificaciones: 'Certifications',
      alianzas: 'Alliances',
      contacto: 'Contact',
    },
    regionSwitcher: 'Choose your region',
    languageToggle: 'Language',
    form: {
      honeypot: 'Do not fill in this field',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      region: 'Region',
      message: 'Message',
      namePlaceholder: 'Your full name',
      emailPlaceholder: 'name@company.com',
      phonePlaceholder: 'Your contact number',
      messagePlaceholder:
        'Tell us about the products, equipment or services your organization needs…',
      optional: 'optional',
      privacyNote: 'We’ll use your details to follow up on your inquiry.',
      sendContact: 'Send message',
      sending: 'Sending…',
      contactSuccess: 'Thank you! Your message was sent. We will reply very soon.',
      error: 'Please review the highlighted fields and try again.',
      rateLimited: 'Too many attempts. Try again in a few minutes.',
    },
    validation: {
      name: 'Enter your full name.',
      email: 'Enter a valid email address.',
      phone: 'Enter a valid phone number.',
      region: 'Select a region.',
      message: 'Tell us a little more (at least 10 characters).',
    },
    whatsapp: {
      aria: 'Message us on WhatsApp',
      defaultMessage: 'Hi Medval Supplies, I would like to receive more information.',
    },
    contact: {
      whatsapp: 'WhatsApp',
      heading: 'Tell us what',
      headingAccent: 'your facility needs.',
      lead: 'Tell us which medicines, equipment, or supplies your facility needs and where you operate.',
      formEyebrow: 'Let’s talk about what you need',
      formHeading: 'We’re here to help.',
      formDescription:
        'Leave us a message. Together, we’ll find the right solution for your organization.',
    },
    homeCtaFallback: 'About Us',
    social: 'Social media',
  },
}

export const getUIStrings = (language: string): UIStrings =>
  uiStrings[isLanguageCode(language) ? language : 'es']
