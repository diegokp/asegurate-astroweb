# JSON-LD — Fase 3

Fecha: 2026-11-12. Cada página emite **un solo** `<script type="application/ld+json">` con un `@graph`. Validado sobre el build con un script local (JSON válido, un solo bloque, `@id` resueltos dentro de la página, sin valores vacíos, URLs `https://www…`, `InsuranceAgency` idéntica en las 65 páginas con JSON-LD): **0 errores**. La 404 y las 2 datacards no llevan JSON-LD.

## Tipos por plantilla

| Plantilla | Nodos del `@graph` |
|---|---|
| Home `/` | `InsuranceAgency`, `WebSite`, `WebPage` (`about` → agencia). Sin `BreadcrumbList` |
| Ramos `/seguro-las-palmas/<ramo>/` (25) | `InsuranceAgency`, `WebSite`, `BreadcrumbList` (Inicio > ramo), `WebPage`, `Service` (`provider` → agencia, `areaServed`, sin `Offer` ni precios) |
| `/blog/` | `InsuranceAgency`, `WebSite`, `BreadcrumbList`, `WebPage`, `Blog` con sus 32 `BlogPosting` |
| Artículos (32) | `InsuranceAgency`, `WebSite`, `BreadcrumbList`, `WebPage`, `Blog` (mínimo), `BlogPosting` |
| `/contacto/` | `InsuranceAgency`, `WebSite`, `BreadcrumbList`, `ContactPage` |
| `/asistencia/` y 4 legales | `InsuranceAgency`, `WebSite`, `BreadcrumbList`, `WebPage` |
| 404 | Ninguno |

## InsuranceAgency (igual en todas las páginas)

`name` «Asegura-Te», `legalName`, `url`, `description`, `logo` (`ImageObject` 1200×420), `image`, `telephone`, `email`, `contactPoint` (los 2 teléfonos), `address` (Playa de Arinaga, 35118, Canarias, ES), `geo`, `areaServed` (Islas Canarias, España), `sameAs` (Facebook, Instagram, LinkedIn, TikTok). Se omiten, por no tener dato, `openingHours` y `foundingDate` (ver [SEO-DATOS-PENDIENTES.md](SEO-DATOS-PENDIENTES.md)).

## Desviaciones respecto al prompt (a propósito)

- **Agencia completa en todas las páginas**, no solo en la home. El prompt pide `InsuranceAgency` «por `@id`» en las demás y a la vez que sea idéntica en todas (Fase 6). Con la definición completa en cada página los `@id` se resuelven sin depender de otra URL.
- **Sin `hasOfferCatalog`.** Con la agencia idéntica en todas las páginas añadiría unos 3 KB a cada una de las 68 páginas, y el valor es bajo: cada ramo ya enlaza a la agencia con `provider`. Si lo quieres solo en la home, hay que sacar el catálogo a un nodo propio.
- **Sin `author` en los artículos**: no muestran autor (regla: solo lo visible).
- **Sin `dateModified`**: no hay fecha real de modificación. Nuevo campo opcional `updateDate` en el frontmatter; si se rellena, se emite.
- **Miga «Seguros» eliminada** de los ramos: apuntaba a `/seguro-las-palmas/`, que da 404 (A1).
- **Frases con promesas retiradas de la `description` del `Service`** en 5 ramos: `autos` («con las mejores compañías»), `salud` («los mejores hospitales … sin esperas»), `flotas` («tarifas por volumen»), `unit-linked` («potencial de rentabilidad superior») y `sialp` («rentabilidad garantizada»). El resto de descripciones de ramo no se han contrastado con el texto visible de cada página.

## URL por plantilla para el Rich Results Test y el Schema Markup Validator

Tras desplegar, pasa una por plantilla en <https://search.google.com/test/rich-results> y <https://validator.schema.org/>:

- Home: `https://www.aseguratte.es/`
- Ramo: `https://www.aseguratte.es/seguro-las-palmas/salud/`
- Blog: `https://www.aseguratte.es/blog/`
- Artículo: `https://www.aseguratte.es/blog/cambiar-de-seguro/`
- Contacto: `https://www.aseguratte.es/contacto/`
- Asistencia: `https://www.aseguratte.es/asistencia/`
- Legal: `https://www.aseguratte.es/aviso-legal/`

Hasta que se despliegue, los testers no verán estos cambios. `Service`, `Blog` y `ContactPage` no generan resultados enriquecidos en Google; sirven para el grafo de entidades.
