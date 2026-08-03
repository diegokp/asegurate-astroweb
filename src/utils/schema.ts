export const siteURL = "https://www.aseguratte.es";
export const AGENCY_ID = `${siteURL}/#agency`;
export const WEBSITE_ID = `${siteURL}/#website`;

export interface FAQ {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function buildAgencySchema() {
  return {
    "@type": "InsuranceAgency",
    "@id": AGENCY_ID,
    "name": "Aseguratte",
    "url": siteURL,
    "logo": `${siteURL}/images/asegurate_logoW.png`,
    "image": `${siteURL}/images/asegurate_logoW.png`,
    "telephone": "+34828661940",
    "email": "info@aseguratte.es",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Domingo Monteverde 144 Bajo A",
      "postalCode": "35118",
      "addressLocality": "Las Palmas de Gran Canaria",
      "addressRegion": "Canarias",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 27.8609851,
      "longitude": -15.4011986
    },
    "areaServed": [
      "Las Palmas de Gran Canaria",
      "Gran Canaria",
      "Islas Canarias"
    ],
    "sameAs": []
  };
}

export function buildWebsiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    "url": siteURL,
    "name": "Asegura-Te",
    "description": "Correduría de Seguros en Las Palmas de Gran Canaria. Seguros de hogar, coche, salud, vida y más para particulares y empresas.",
    "inLanguage": "es",
    "publisher": { "@id": AGENCY_ID }
  };
}

interface WebPageSchemaOptions {
  pageURL: string;
  name: string;
  description?: string;
  breadcrumb: BreadcrumbItem[];
}

export function buildWebPageSchema(opts: WebPageSchemaOptions) {
  const { pageURL, name, description, breadcrumb } = opts;
  const items = [{ name: "Inicio", item: siteURL }, ...breadcrumb];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageURL}#breadcrumb`,
        "itemListElement": items.map((it, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": it.name,
          "item": it.item
        }))
      },
      {
        "@type": "WebPage",
        "@id": `${pageURL}#webpage`,
        "url": pageURL,
        "name": name,
        ...(description ? { description } : {}),
        "isPartOf": { "@id": WEBSITE_ID },
        "inLanguage": "es"
      }
    ]
  };
}

interface ServiceSchemaOptions {
  pageURL: string;
  name: string;
  description: string;
  serviceType: string;
  breadcrumbName: string;
  faqs?: FAQ[];
}

export function buildServiceSchema(opts: ServiceSchemaOptions) {
  const { pageURL, name, description, serviceType, breadcrumbName, faqs = [] } = opts;

  const graph: object[] = [
    {
      "@type": "BreadcrumbList",
      "@id": `${pageURL}#breadcrumb`,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Inicio", "item": siteURL },
        { "@type": "ListItem", "position": 2, "name": "Seguros", "item": `${siteURL}/seguro-las-palmas/` },
        { "@type": "ListItem", "position": 3, "name": breadcrumbName, "item": pageURL }
      ]
    },
    {
      "@type": "Service",
      "@id": `${pageURL}#service`,
      "name": name,
      "serviceType": serviceType,
      "category": "Insurance",
      "description": description,
      "areaServed": ["Las Palmas de Gran Canaria", "Gran Canaria", "Islas Canarias"],
      "provider": { "@id": AGENCY_ID },
      "url": pageURL
    }
  ];

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

  return { "@context": "https://schema.org", "@graph": graph };
}
