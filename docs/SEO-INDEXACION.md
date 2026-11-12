# Indexación — Fase 4

Fecha: 2026-11-12. Verificado sobre el build (68 páginas, `astro check` sin errores).

## Hecho

| Qué | Resultado |
|---|---|
| Legales (`/aviso-legal/`, `/politica-privacidad/`, `/politica-privacidad-redes/`, `/cookies/`) | `<meta name="robots" content="noindex, follow">`. Fuera del sitemap |
| Datacards (`/datacard/oficina/`, `/datacard/lidia/`) | Pasan de `noindex` a `noindex, follow`. Fuera del sitemap (ya lo estaban) |
| 404 | `noindex, follow` (Fase 2), sin canonical |
| `robots.txt` | Generado en el build ([robots.txt.ts](../src/pages/robots.txt.ts)); sitemap absoluto con `www`; IA permitida por defecto, `AI_CRAWLERS=block` para bloquearla |
| **`Disallow: /datacard/` eliminado** | Si `robots.txt` bloquea una URL, Google no puede leer su `noindex`. Ahora puede rastrearlas y verlo. Siguen sin enlaces internos ni sitemap |
| Sitemap | 61 URLs (antes 65: salen las 4 legales). Solo indexables y existentes. `lastmod` en 30 (29 artículos publicados y `/blog/`) |

Todas las demás páginas (61) siguen con `index, follow`.

## `lastmod`

Solo donde hay una fecha editorial real: artículos (`updateDate`, o `publishDate` si no existe) y `/blog/` (el artículo publicado más reciente). Home, ramos, contacto y asistencia **no llevan `lastmod`**: no hay una fecha fiable por página, y una inventada o igual para todas haría que Google deje de fiarse del campo. Los 3 artículos con fecha futura tampoco lo llevan (siguen en el sitemap; ver pregunta abajo).

## Pendiente

1. **Artículos con fecha futura** (`aseguradora-no-renueva-poliza`, `reforma-vivienda-seguro-hogar`, `tormenta-coche-seguro-consorcio`): están publicados y en el sitemap. ¿Se mantienen o se ocultan hasta su fecha?
2. **Redirecciones de URLs antiguas** (decisión 5): siguen en 404.
3. **Tras desplegar:** en Search Console, reenviar `sitemap-index.xml` en la propiedad `https://www.aseguratte.es/` y solicitar la reindexación de una legal para que registre el `noindex`. Las legales ya indexadas tardarán días o semanas en salir.
4. **Riesgo asumido:** las legales con `noindex` siguen siendo accesibles desde el pie. Quien busque la política de privacidad la encontrará desde la web, no desde Google.
