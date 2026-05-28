export const siteURL = "https://www.aseguratte.es";

interface FAQ {
  question: string;
  answer: string;
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
      "provider": { "@id": `${siteURL}/#agency` },
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
