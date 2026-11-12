/**
 * Fuente única de los datos de empresa para SEO (metas, JSON-LD, sitemap, llms.txt).
 *
 * Reglas:
 *  - Solo datos que la web ya muestra. No inventar: lo que falte va a docs/SEO-DATOS-PENDIENTES.md
 *    y la propiedad se OMITE (nunca se deja vacía ni falsa).
 *  - Cambiar un dato aquí lo cambia en todas partes que lo consuman.
 *
 * Estado (2026-11-12, Fase 2): los valores reproducen lo que la web publica hoy. Las decisiones
 * abiertas están marcadas con DECISIÓN y descritas en docs/SEO-AUDITORIA.md (sección 8).
 */

export interface SiteConfig {
  /** Dominio de producción, con www y sin barra final. */
  url: string;
  /** Nombre público de la marca. */
  name: string;
  /** Razón social, tal y como figura en los textos legales. */
  legalName: string;
  /** Idioma del sitio (atributo lang). */
  lang: string;
  /** Tipo schema.org de la entidad principal. */
  type: 'InsuranceAgency';
  /** Descripción corta del sitio (sin promesas de precio, ahorro ni cobertura). */
  description: string;
  address: {
    streetAddress: string;
    postalCode: string;
    /** Decisión 1 (2026-11-12): la dirección está en la localidad de Playa de Arinaga. */
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  /** Dirección tal y como se muestra en el pie de página. */
  addressDisplay: string;
  phones: { display: string; e164: string }[];
  /** Número de WhatsApp en formato internacional sin «+». */
  whatsapp: string;
  email: string;
  /** Perfiles sociales; todos se publican en `sameAs`. */
  social: { facebook?: string; instagram?: string; linkedin?: string; tiktok?: string };
  /** Decisión 2 (2026-11-12): zona de servicio = Islas Canarias y España. */
  areaServed: { type: 'AdministrativeArea' | 'Country'; name: string }[];
  geo?: { latitude: number; longitude: number };
  /** Imagen por defecto para Open Graph/Twitter: archivo existente y sus dimensiones reales. */
  ogImage: { path: string; width: number; height: number; type: string; alt: string };
  logo: string;
  // Sin datos en la web ni en el repo (ver docs/SEO-DATOS-PENDIENTES.md): openingHours, foundingDate, dgsfp.
  openingHours?: string[];
  foundingDate?: string;
  dgsfpRegistration?: string;
}

export const site: SiteConfig = {
  url: 'https://www.aseguratte.es',
  name: 'Asegura-Te',
  legalName: 'Asegura-Te Correduría de Seguros SL',
  lang: 'es',
  type: 'InsuranceAgency',
  description:
    'Correduría de seguros en las Islas Canarias. Seguros de hogar, coche, salud, vida y más para particulares y empresas.',
  address: {
    streetAddress: 'Calle Domingo Monteverde 144 Bajo A',
    postalCode: '35118',
    addressLocality: 'Playa de Arinaga',
    addressRegion: 'Canarias',
    addressCountry: 'ES',
  },
  addressDisplay: 'Calle Domingo Monteverde 144 Bajo A, Playa de Arinaga 35118. Las Palmas de Gran Canaria',
  phones: [
    { display: '(+34) 828 66 19 40', e164: '+34828661940' },
    { display: '(+34) 665 28 82 69', e164: '+34665288269' },
  ],
  whatsapp: '34665288269',
  email: 'info@aseguratte.es',
  // Decisión 10 (2026-11-12): los cuatro perfiles entran en `sameAs`. Se usan las formas canónicas
  // (sin el parámetro de seguimiento `__tn__` ni el subdominio móvil del pie). LinkedIn es un
  // perfil personal (/in/), así que va codificado; el nombre «Asegura-Te» sale de ese perfil.
  social: {
    facebook: 'https://www.facebook.com/asegurattebylidiagonzalez/',
    instagram: 'https://www.instagram.com/asegurattecorreduria/',
    linkedin: 'https://www.linkedin.com/in/asegura-te-by-lidia-gonz%C3%A1lez-42015b28/',
    tiktok: 'https://www.tiktok.com/@asegurattecorreduria',
  },
  areaServed: [
    { type: 'AdministrativeArea', name: 'Islas Canarias' },
    { type: 'Country', name: 'España' },
  ],
  geo: { latitude: 27.8609851, longitude: -15.4011986 },
  // El logo mide 1200×420 (comprobado con `file`). Antes se declaraba 1200×630.
  ogImage: {
    path: '/images/asegurate_logoW.png',
    width: 1200,
    height: 420,
    type: 'image/png',
    alt: 'Asegura-Te — Correduría de Seguros en Las Palmas',
  },
  logo: '/images/asegurate_logoW.png',
};

/** URL absoluta a partir de una ruta del sitio. */
export const abs = (path: string): string => new URL(path, site.url + '/').toString();

/** Campos obligatorios: si falta alguno, el build avisa (no se inventa un valor). */
const REQUIRED: [string, unknown][] = [
  ['url', site.url],
  ['name', site.name],
  ['description', site.description],
  ['address.streetAddress', site.address.streetAddress],
  ['address.postalCode', site.address.postalCode],
  ['address.addressLocality', site.address.addressLocality],
  ['phones', site.phones.length],
  ['email', site.email],
  ['areaServed', site.areaServed.length],
  ['ogImage.path', site.ogImage.path],
];

for (const [key, value] of REQUIRED) {
  if (!value) console.warn(`[site.ts] AVISO SEO: falta el dato obligatorio «${key}».`);
}
