# Asegura-Te — aseguratte.es

Web de **Asegura-Te Correduría de Seguros**, con oficina en Playa de Arinaga (Gran Canaria) y servicio en las Islas Canarias y España. Sitio estático con una página por ramo de seguro, un blog en Markdown y una capa SEO verificada automáticamente en cada build.

- **Producción:** <https://www.aseguratte.es> (siempre con `https`, `www` y barra final en las páginas).
- **Stack:** Astro 6 · Vue 3 · Tailwind CSS v3 · TypeScript. `~` es un alias de `src/`.
- **Hosting:** LiteSpeed (lee `public/.htaccess`). Se despliega subiendo `dist/` por FTP.
- **Analítica:** Plausible.

## Puesta en marcha

Requiere Node 22 o superior.

```bash
npm install          # el proyecto usa legacy-peer-deps (ver .npmrc): @astrojs/tailwind declara peers de Astro ≤5
npm run dev          # servidor en http://localhost:4321
npm run build        # astro check + build en ./dist/ + seo:check (falla si hay errores SEO)
npm run seo:check    # verificación SEO de ./dist (necesita un build previo); -- --strict hace fallar también los avisos
npm run preview      # previsualiza el build
```

En `npm run dev` no existen `robots.txt` ni `llms.txt`, ni el sitemap: se generan al hacer el build.

## Estructura

```text
src/
├── config/
│   ├── site.ts          # Fuente única de datos de empresa (nombre, dirección, teléfonos, redes, zona de servicio…)
│   ├── indexing.ts      # Páginas noindex (legales y datacards)
│   └── sitemap.ts       # Filtro y lastmod del sitemap
├── integrations/
│   └── llms-txt.ts      # Genera dist/llms.txt al final del build
├── layouts/Layout.astro # Metas, canonical, Open Graph y un solo bloque JSON-LD por página
├── pages/
│   ├── index.astro
│   ├── seguro-las-palmas/*.astro   # un ramo por página (25)
│   ├── blog/                       # listado y artículos
│   ├── contacto, asistencia y páginas legales
│   └── robots.txt.ts               # robots.txt generado
├── content/blog/*.md    # artículos
├── components/          # Astro y Vue (los interactivos usan client:only="vue")
└── utils/               # schema.ts (JSON-LD) y seo.ts
public/                  # imágenes, .htaccess y api/data.json
scripts/seo-check.mjs    # verificación SEO tras el build
docs/                    # auditoría y decisiones SEO
```

## Cómo se trabaja con cada parte

### Datos de empresa
Nombre, dirección, teléfonos, correo, redes y zona de servicio están **solo** en `src/config/site.ts`. El JSON-LD, `llms.txt` y las comprobaciones salen de ahí. Los datos que la web aún no tiene (horario, año de fundación, registro DGSFP) están en [docs/SEO-DATOS-PENDIENTES.md](docs/SEO-DATOS-PENDIENTES.md) y no se inventan.

### Páginas de ramo
Todas siguen la misma estructura: `Layout` > `SegurosPage` > `ContactForm` > `SegurosLink`, y pasan su JSON-LD con `buildServiceSchema()`. Un ramo nuevo debe añadirse también a `GROUPS` en `src/integrations/llms-txt.ts`.

### Blog
- Los artículos están en `src/content/blog/*.md` y las imágenes en `public/images/blog/{slug}.webp` (todo `.webp`).
- Campos del frontmatter: `title`, `slug`, `image`, `imageAlt`, `excerpt`, `description` (150–160 caracteres), `publishDate`, `updateDate?`, `link`, `last`, `clasificacion`. Exactamente un artículo con `last: true`.
- El `link` es siempre una ruta interna con barra final que exista; por defecto `/contacto/`.
- **El listado de `/blog/` no se genera desde la colección:** `articulos.vue` descarga `public/api/data.json` desde GitHub (`raw.githubusercontent.com`) en el navegador. Cualquier cambio en `image`, `title` o `excerpt` de un artículo debe copiarse a mano a ese JSON. Existe una skill del proyecto, `blog-nueva-publicacion`, con el flujo completo.

### SEO e indexación
- **JSON-LD:** un solo `@graph` por página con la agencia, el sitio y los nodos de la página; se construye en `src/utils/schema.ts`. Sin precios, valoraciones ni promesas.
- **`noindex, follow`:** las 4 páginas legales y `/datacard/*`, fuera del sitemap. Una página nueva `noindex` se declara en `src/config/indexing.ts`.
- **`robots.txt`:** generado. Los crawlers de IA están permitidos; para bloquearlos, `AI_CRAWLERS=block npm run build`.
- **Redirecciones:** `public/.htaccess` (https, host `www`, `/index.html` y URLs antiguas). Detalle en [docs/SEO-REDIRECCIONES.md](docs/SEO-REDIRECCIONES.md).
- **Verificación:** `seo:check` comprueba metas, canonical, Open Graph, JSON-LD, NAP, sitemap, enlaces y `llms.txt`. Los errores técnicos rompen el build; los avisos de contenido (longitud de títulos y descripciones) quedan en [docs/SEO-VERIFICACION.md](docs/SEO-VERIFICACION.md).

## Despliegue

1. `npm run build` (debe terminar sin errores de `seo:check`).
2. Subir el contenido de `dist/` al hosting **incluido `.htaccess`**, que es un archivo oculto.
3. Comprobar las redirecciones con los `curl` de [docs/SEO-REDIRECCIONES.md](docs/SEO-REDIRECCIONES.md). Si el navegador avisa de demasiadas redirecciones, borrar `.htaccess` del servidor.
4. En Search Console, reenviar `sitemap-index.xml` en la propiedad `https://www.aseguratte.es/`.

## Documentación

| Documento | Contenido |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Guía técnica completa para trabajar en el repo (arquitectura, reglas de SEO y de blog) |
| [docs/SEO-AUDITORIA.md](docs/SEO-AUDITORIA.md) | Auditoría inicial y decisiones tomadas |
| [docs/SEO-JSONLD.md](docs/SEO-JSONLD.md) | Tipos de JSON-LD por plantilla y URLs para los validadores |
| [docs/SEO-INDEXACION.md](docs/SEO-INDEXACION.md) | Sitemap, `noindex` y `robots.txt` |
| [docs/SEO-LLMS.md](docs/SEO-LLMS.md) | Cómo se genera `llms.txt` |
| [docs/SEO-REDIRECCIONES.md](docs/SEO-REDIRECCIONES.md) | Reglas del `.htaccess` y comprobaciones tras desplegar |
| [docs/SEO-METAS-PROPUESTAS.md](docs/SEO-METAS-PROPUESTAS.md) | Propuestas de title y description del blog, sin aplicar |
| [docs/SEO-VERIFICACION.md](docs/SEO-VERIFICACION.md) | Último resultado de `seo:check` (se regenera en cada build) |
