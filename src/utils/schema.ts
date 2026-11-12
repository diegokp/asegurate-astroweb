import { site } from "~/config/site";

/**
 * Fuente única del JSON-LD. Cada página emite UN solo <script> con un @graph:
 *   [InsuranceAgency, WebSite, ...nodos de la página]
 * `Layout.astro` compone el grafo; las páginas solo aportan sus nodos con estos constructores.
 * Reglas: solo lo que la página muestra, sin promesas de precio/ahorro/cobertura, sin propiedades vacías.
 */

export const siteURL = site.url;
export const AGENCY_ID = `${siteURL}/#agency`;
export const WEBSITE_ID = `${siteURL}/#website`;
export const LOGO_ID = `${siteURL}/#logo`;
export const LANG = "es-ES";
export const BLOG_NAME = "Blog de Seguros — Asegura-Te";

export interface FAQ {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

/** Nodos que aporta una página al grafo (Layout añade agencia y sitio). */
export interface PageSchema {
  "@graph": object[];
}

export function buildAgencySchema() {
  const logoUrl = `${siteURL}${site.logo}`;
  const logoIsOgImage = site.logo === site.ogImage.path;
  return {
    "@type": site.type,
    "@id": AGENCY_ID,
    "name": site.name,
    "legalName": site.legalName,
    "url": `${siteURL}/`,
    "description": site.description,
    "logo": {
      "@type": "ImageObject",
      "@id": LOGO_ID,
      "url": logoUrl,
      ...(logoIsOgImage ? { "width": site.ogImage.width, "height": site.ogImage.height } : {})
    },
    "image": logoUrl,
    "telephone": site.phones[0].e164,
    "email": site.email,
    "contactPoint": site.phones.map((p) => ({
      "@type": "ContactPoint",
      "telephone": p.e164,
      "contactType": "customer service",
      "availableLanguage": "es"
    })),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": site.address.streetAddress,
      "postalCode": site.address.postalCode,
      "addressLocality": site.address.addressLocality,
      "addressRegion": site.address.addressRegion,
      "addressCountry": site.address.addressCountry
    },
    ...(site.geo ? { "geo": { "@type": "GeoCoordinates", "latitude": site.geo.latitude, "longitude": site.geo.longitude } } : {}),
    "areaServed": areaServedNodes(),
    "sameAs": Object.values(site.social).filter(Boolean),
    ...(site.openingHours?.length ? { "openingHours": site.openingHours } : {}),
    ...(site.foundingDate ? { "foundingDate": site.foundingDate } : {})
  };
}

export function areaServedNodes() {
  return site.areaServed.map((a) => ({ "@type": a.type, "name": a.name }));
}

export function buildWebsiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    "url": `${siteURL}/`,
    "name": site.name,
    "description": site.description,
    "inLanguage": LANG,
    "publisher": { "@id": AGENCY_ID }
  };
}

function breadcrumbNode(pageURL: string, items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageURL}#breadcrumb`,
    "itemListElement": items.map((it, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": it.name,
      "item": it.item
    }))
  };
}

interface WebPageSchemaOptions {
  pageURL: string;
  name: string;
  description?: string;
  /** Migas tras «Inicio». Vacío o ausente en la home. */
  breadcrumb?: BreadcrumbItem[];
  /** `ContactPage` en /contacto/; `WebPage` por defecto. */
  pageType?: "WebPage" | "ContactPage";
  /** La home declara que trata de la agencia. */
  isHome?: boolean;
  /** Nodo principal de la página (p. ej. el Service de un ramo). */
  mainEntityId?: string;
}

export function buildWebPageSchema(opts: WebPageSchemaOptions): PageSchema {
  const { pageURL, name, description, breadcrumb = [], pageType = "WebPage", isHome = false, mainEntityId } = opts;
  const nodes: object[] = [];

  if (!isHome) {
    nodes.push(breadcrumbNode(pageURL, [{ name: "Inicio", item: `${siteURL}/` }, ...breadcrumb]));
  }

  nodes.push({
    "@type": pageType,
    "@id": `${pageURL}#webpage`,
    "url": pageURL,
    "name": name,
    ...(description ? { "description": description } : {}),
    "isPartOf": { "@id": WEBSITE_ID },
    ...(isHome ? { "about": { "@id": AGENCY_ID } } : {}),
    ...(isHome ? {} : { "breadcrumb": { "@id": `${pageURL}#breadcrumb` } }),
    ...(mainEntityId ? { "mainEntity": { "@id": mainEntityId } } : {}),
    "inLanguage": LANG
  });

  return { "@graph": nodes };
}

interface ServiceSchemaOptions {
  pageURL: string;
  name: string;
  description: string;
  serviceType: string;
  breadcrumbName: string;
  faqs?: FAQ[];
}

/** Página de ramo: BreadcrumbList + WebPage + Service (sin Offer ni precios). */
export function buildServiceSchema(opts: ServiceSchemaOptions): PageSchema {
  const { pageURL, name, description, serviceType, breadcrumbName, faqs = [] } = opts;
  const serviceId = `${pageURL}#service`;

  const page = buildWebPageSchema({
    pageURL,
    name,
    description,
    // La miga intermedia «Seguros» apuntaba a /seguro-las-palmas/, que no existe (404): se elimina.
    breadcrumb: [{ name: breadcrumbName, item: pageURL }],
    mainEntityId: serviceId
  });

  const graph: object[] = [
    ...page["@graph"],
    {
      "@type": "Service",
      "@id": serviceId,
      "name": name,
      "serviceType": serviceType,
      "category": "Insurance",
      "description": description,
      "areaServed": areaServedNodes(),
      "provider": { "@id": AGENCY_ID },
      "url": pageURL
    }
  ];

  // FAQPage solo con preguntas visibles en la página (hoy ningún ramo las muestra).
  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageURL}#faq`,
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
      }))
    });
  }

  return { "@graph": graph };
}

export interface BlogPostSummary {
  url: string;
  headline: string;
  datePublished: string;
  image?: string;
}

interface BlogIndexOptions {
  pageURL: string;
  name: string;
  description: string;
  posts: BlogPostSummary[];
}

/** /blog/: WebPage + BreadcrumbList + Blog con sus entradas (mismos @id que los artículos). */
export function buildBlogIndexSchema(opts: BlogIndexOptions): PageSchema {
  const { pageURL, name, description, posts } = opts;
  const blogId = `${pageURL}#blog`;
  const page = buildWebPageSchema({
    pageURL,
    name,
    description,
    breadcrumb: [{ name: "Blog", item: pageURL }],
    mainEntityId: blogId
  });
  return {
    "@graph": [
      ...page["@graph"],
      {
        "@type": "Blog",
        "@id": blogId,
        "name": name,
        "description": description,
        "url": pageURL,
        "inLanguage": LANG,
        "publisher": { "@id": AGENCY_ID },
        "blogPost": posts.map((p) => ({
          "@type": "BlogPosting",
          "@id": `${p.url}#article`,
          "headline": p.headline,
          "url": p.url,
          "datePublished": p.datePublished,
          ...(p.image ? { "image": p.image } : {})
        }))
      }
    ]
  };
}

interface BlogPostOptions {
  pageURL: string;
  headline: string;
  description: string;
  datePublished: string;
  /** Solo si existe una fecha de modificación real (campo `updateDate` del artículo). */
  dateModified?: string;
  image: { url: string; width?: number; height?: number };
  blogURL: string;
}

/** Artículo: BreadcrumbList + WebPage + BlogPosting. Sin `author`: el artículo no muestra autor. */
export function buildBlogPostSchema(opts: BlogPostOptions): PageSchema {
  const { pageURL, headline, description, datePublished, dateModified, image, blogURL } = opts;
  const articleId = `${pageURL}#article`;
  const blogId = `${blogURL}#blog`;
  const page = buildWebPageSchema({
    pageURL,
    name: headline,
    description,
    breadcrumb: [
      { name: "Blog", item: blogURL },
      { name: headline, item: pageURL }
    ],
    mainEntityId: articleId
  });
  return {
    "@graph": [
      ...page["@graph"],
      // Nodo mínimo del blog para que `isPartOf` se resuelva dentro de la página (el completo está en /blog/).
      { "@type": "Blog", "@id": blogId, "name": BLOG_NAME, "url": blogURL },
      {
        "@type": "BlogPosting",
        "@id": articleId,
        "headline": headline,
        "description": description,
        "image": {
          "@type": "ImageObject",
          "url": image.url,
          ...(image.width ? { "width": image.width } : {}),
          ...(image.height ? { "height": image.height } : {})
        },
        "datePublished": datePublished,
        ...(dateModified ? { "dateModified": dateModified } : {}),
        "url": pageURL,
        "inLanguage": LANG,
        "isPartOf": { "@id": blogId },
        "publisher": { "@id": AGENCY_ID },
        "mainEntityOfPage": { "@id": `${pageURL}#webpage` }
      }
    ]
  };
}
