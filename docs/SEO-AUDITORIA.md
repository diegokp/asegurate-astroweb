# Auditoría SEO técnica — aseguratte.es

Fecha: 2026-11-12 · Fases 0 y 1 del prompt (modo REVISIÓN). **Solo informe: no se ha modificado código, contenido ni URLs.**
Método: `astro build` (68 páginas), análisis del HTML de `dist/`, lectura del código y comprobación con `curl` de la web en producción. No se ha probado en navegador ni en Search Console / Rich Results Test, y no se ha ejecutado PageSpeed.

Leyenda: ✅ cumple · ⚠️ mejorable · ❌ falla.

---

## 1. Reconocimiento (Fase 0)

### Stack y despliegue

| Dato | Hallazgo |
|---|---|
| Astro | `site: https://www.aseguratte.es`, sin `trailingSlash` ni `build.format` (por defecto: `directory`, URLs con barra final) |
| Integraciones | vue, tailwind, `@astrojs/sitemap` (filtra `/datacard/`), markdoc |
| Servidor | **LiteSpeed**, no Apache a secas (cabecera `server`). `.htaccess` funciona en LiteSpeed |
| Repo | **No hay `.htaccess`** ni ninguna regla de redirección |
| `site.ts` / config central | No existe. Los datos de empresa están en `src/utils/schema.ts`, en `footer.astro`, en `llms.txt` y en los textos legales |
| `public/` | `robots.txt`, `llms.txt` (a mano), `api/data.json`, imágenes, fuentes |
| Producción vs repo | La home de producción lleva `last-modified: 28 sep 2026`. El repo tiene cambios posteriores (artículos de octubre y noviembre) |

### Inventario de `dist/` (68 páginas)

| Tipo | Nº |
|---|---|
| Home | 1 |
| Ramos `/seguro-las-palmas/*` | 25 |
| Blog: índice + artículos | 1 + 32 |
| Contacto, asistencia | 2 |
| Legales (aviso legal, privacidad, privacidad redes, cookies) | 4 |
| 404 | 1 |
| `/datacard/lidia/`, `/datacard/oficina/` | 2 |

### URLs antiguas o duplicadas: dónde existen (comprobado con `curl -I`)

| URL | En el repo | En producción | Visitas Plausible |
|---|---|---|---|
| `/index.html` | Sí (Astro lo genera) | **200 duplicado de `/`** | 93 |
| `/cookies/index.html` | Sí | **200 duplicado de `/cookies/`** | — |
| `/politicadeprivacidad.html` | No | 404 | — |
| `/contacto.html` | No | 404 | — |
| `/contactotrabajo.php` | No (solo en un comentario HTML del pie) | 404 | — |
| `/landings/asistencia.html` | No | 404 | — |
| `/blog2/` | No | 404 | — |
| `/datacard/oficina.html` | No (la página es `/datacard/oficina/`) | 404 | — |
| `/sitemap-xml` | No | 404 | — |
| `/blog`, `/contacto` y artículos sin barra | — | 301 a la versión con barra | — |

Las URLs antiguas ya no existen en ningún sitio: devuelven 404, no una redirección. Dejarlas así es una opción (decisión 5).

---

## 2. Problemas priorizados

### 🔴 Críticos

| # | Problema | Evidencia | Efecto |
|---|---|---|---|
| C1 | **El canonical de todo el blog apunta a una URL que redirige.** 33 páginas (índice + 32 artículos) declaran el canonical **sin barra** y el servidor responde 301 a la versión **con barra**. El sitemap lista las URLs con barra | `curl`: `/blog/cambiar-de-seguro` → 301 → `/blog/cambiar-de-seguro/`; su canonical es `…/cambiar-de-seguro`. Código: `[...slug].astro` y `blog/index.astro` construyen la URL sin barra | Señales contradictorias (canonical ≠ URL servida ≠ sitemap). Google puede ignorar el canonical |
| C2 | **El sitio responde 200 en HTTP y sin `www`, sin redirigir.** `http://www.aseguratte.es/` y `https://aseguratte.es/` sirven la web completa | `curl`: ambos 200, sin `redirect_url` | Cuatro versiones accesibles de cada página. Solo el canonical lo mitiga. Falta HTTPS forzado y un único host |
| C3 | **31 artículos enlazan a `/contacto.html`, que da 404.** Es el CTA del frontmatter (`link: /contacto.html`) | `grep` en `src/content/blog`: 31 de 32; producción: 404 | El botón de contacto de casi todo el blog está roto. Pierde conversiones y rastreo interno |

### 🟠 Altos

| # | Problema | Evidencia |
|---|---|---|
| A1 | **Las 25 migas de los ramos enlazan a `/seguro-las-palmas/`, que no existe** (404). Es el segundo nivel del `BreadcrumbList` | `schema.ts:114`; `curl`: 404 |
| A2 | **`og:image` declara 1200×630 pero el logo mide 1200×420**, y declara `image/png` también para los artículos, cuya imagen es `.webp` de 1536×1024 | `file public/images/asegurate_logoW.png`; `Layout.astro:57-59` fijos para todas las páginas |
| A3 | **Las 4 páginas legales no tienen `<h1>`** y están en el sitemap sin `noindex` | `grep` de `<h1` en `aviso-legal`, `cookies`, `politica-privacidad`, `politica-privacidad-redes`: 0 |
| A4 | **La 404 tiene canonical a la home y `robots: index, follow`**. Debería ser `noindex` y sin canonical | `dist/404.html` |
| A5 | **JSON-LD: `sameAs` vacío y un solo teléfono.** Hay 4 redes y 2 teléfonos visibles. `name` dice «Aseguratte» y la web dice «Asegura-Te» | `schema.ts:21,23,43` |
| A6 | **Descripciones demasiado cortas.** Ramos: solo 2 de 25 están entre 150 y 160 caracteres, 7 tienen menos de 120. Blog: 8 de 32 | Ver tablas |
| A7 | **Promesas de precio, ahorro o «lo mejor» en metas y JSON-LD** (regla 2, sector YMYL) | Ver sección 4 |

### 🟡 Medios

| # | Problema |
|---|---|
| M1 | **Títulos del blog demasiado largos** (ver `docs/SEO-METAS-PROPUESTAS.md`): 20 de 32 superan 80 caracteres |
| M2 | Títulos de ramos > 60 caracteres: `pias` (68), `defensa-juridica-empresa` (67), `accidentes-convenios` (63). `sialp` no nombra la localidad |
| M3 | **Sin `noindex` posible**: `Layout.astro:44` fija `index, follow` en todas las páginas, y no hay forma de cambiarlo por página |
| M4 | **Sin `dateModified`** en los `BlogPosting`; sin `lastmod` en el sitemap (0 de 65 URLs) |
| M5 | `Blog`/`BlogPosting`: `author` y `publisher` redefinen el nodo `InsuranceAgency` (mismo `@id`, propiedades parciales y distintas) en vez de referenciarlo por `@id` |
| M6 | **WhatsApp: 63 enlaces `api.whatsapp.com/send?…&app=facebook&entry_point=page_cta&fbclid=…`**. Llevan un identificador de seguimiento de Facebook y no son `wa.me` |
| M7 | **LinkedIn del pie es un perfil personal** (`/in/asegura-te-by-lidia-gonzález-…`), no una página de empresa. Facebook usa `m.facebook.com` con parámetro `__tn__` |
| M8 | Dos correos: `info@aseguratte.es` (pie) y `direccion@aseguratte.es` (textos legales) |
| M9 | Páginas con fecha de publicación **futura** ya construidas: 3 artículos con `publishDate` posterior a hoy (entre 2026-11-15 y 2026-12-15) están en `dist/`, en el sitemap, en `llms.txt` y en `data.json` |
| M10 | Datacards: `robots.txt` las bloquea **y** llevan `noindex`; Google no puede leer un `noindex` en una URL bloqueada. Además su `og:url` apunta a `/card/oficina.html` (no existe) y declaran `og:locale:alternate` fr_FR y en_GB |

### 🟢 Bajos

| # | Problema |
|---|---|
| B1 | `viewport` sin `initial-scale=1` |
| B2 | Kit de Font Awesome y cookie-script en `<head>` sin `defer` (puede retrasar el render; no medido) |
| B3 | `/api/post.json` se publica (endpoint sin uso, bloqueado en `robots.txt`) |
| B4 | `alt` vacío o ausente en 1 imagen de cada página legal y de cada datacard |
| B5 | Texto alternativo del logo del pie: «Asegurate logo» (otra variante del nombre) |
| B6 | Barra: la home declara canonical sin barra (`https://www.aseguratte.es`); es equivalente a `/`, pero conviene unificar |

---

## 3. Auditoría por plantilla

### Home

| Elemento | Estado |
|---|---|
| `lang="es"`, viewport, favicon | ✅ (viewport ⚠️ B1) |
| Title «Correduría de Seguros en Las Palmas \| Asegura-Te» (48) | ✅ |
| Description (146) | ⚠️ por debajo de 150; dice «con las mejores compañías» |
| H1 «Correduría de SEGUROS en Las Palmas» | ✅ |
| Canonical sin barra | ⚠️ B6 |
| OG imagen | ❌ A2 |
| JSON-LD: `InsuranceAgency`, `WebSite`, `WebPage` | ⚠️ A5 |
| `<main>` único | ✅ |

### Ramos (25)

| Elemento | Resultado |
|---|---|
| Canonical absoluto, con `www`, con barra y a sí misma | ✅ 25/25 |
| Un solo H1 y un solo `<main>` | ✅ 25/25 |
| Title único | ✅ 25/25 |
| Title ≤ 60 | ⚠️ 22/25 (M2) |
| Localidad en title | ⚠️ 24/25 (falta en `sialp`) |
| Description 150–160 | ❌ 2/25 (`salud` 155, `viajes` 154); 7 con menos de 120 (`unit-linked` 91, `pymes` 100, `vehiculos-clasicos` 111, `mascotas` 112, `sialp` 112, …) |
| Description única | ✅ |
| JSON-LD `Service` + `BreadcrumbList` | ⚠️ A1; `areaServed` solo con textos, sin `City` |
| `alt` en imágenes | ✅ 0 sin alt |
| «Las Palmas» forzado | ⚠️ El patrón «… en Las Palmas» se repite en los 25 títulos, H1 y descripciones, a veces dos veces en la misma frase (`ciclomotores`, `pias`, `oficinas`) |

**Prioritarios.** `vehiculos-clasicos` (description 111, la más corta de los que funcionan), `motos` (131) y `decesos` (145): las tres se quedan por debajo del rango. `salud` (100% de rebote): **no he encontrado ningún fallo técnico en el código.** Usa la misma plantilla (`SegurosPage` + `ContactForm`) que el resto, con `main`, H1, imagen con `width`/`height` y CTA. Su meta y su JSON-LD hablan de «acceso a los mejores hospitales y especialistas sin esperas», una promesa que el texto visible no demuestra. El 100% de rebote puede deberse a pocas visitas o a la intención de búsqueda; con el código no se puede concluir. Hace falta medir en navegador y mirar Search Console.

### Blog (índice + 32 artículos)

| Elemento | Estado |
|---|---|
| Canonical | ❌ C1 |
| Title ≤ 60 | ❌ 2/32 |
| Description 150–160 | ❌ 8/32 |
| Duplicados | ⚠️ 1 par de descripciones |
| H1 único | ✅ |
| `og:type` `article` en artículos | ✅ |
| `og:image` | ❌ A2 (`.webp` declarado como `png` 1200×630) |
| `BlogPosting` | ⚠️ M4, M5; `author` es la organización |
| Índice: listado | ⚠️ El listado se carga en el navegador desde `raw.githubusercontent.com` (`articulos.vue`, `client:only`): el HTML del índice no contiene los artículos, solo el JSON-LD `Blog` |
| CTA de cada artículo | ❌ C3 |

### Contacto, asistencia

Title, description y H1 ✅; canonical ✅. `/contacto/` marca `WebPage` (el prompt pide `ContactPage`). `/asistencia/` ✅.

### Legales (4)

Title y description ✅ (119–146). **H1: ❌** (A3). En el sitemap sin `noindex` (decisión 4). Sus textos contienen variantes del nombre y de la dirección distintas del pie (ver sección 5).

### 404

Código 404 real en producción ✅. Title y description ✅. Canonical a la home y `index, follow` ❌ (A4).

---

## 4. Afirmaciones que habría que revisar (YMYL)

No las he tocado. Son textos del cliente.

| Dónde | Texto |
|---|---|
| Meta, `cambiar-de-seguro` | «**puede ahorrarte dinero**» |
| Meta, home | «con las mejores compañías» |
| Meta, `autos` | «con las mejores garantías» |
| Meta, `comercios` | «elegir el mejor seguro» |
| JSON-LD, `salud` | «Acceso a los mejores hospitales y especialistas sin esperas» |
| Cuerpo, `salud` | «tarifas competitivas», «la mejor protección en el mercado» |
| `llms.txt` | «sin coste para el cliente», «Comparamos coberturas y precios», «sin listas de espera» (salud), «ventajas fiscales» (planes de pensiones) |

---

## 5. SEO local y NAP

| Dato | Dónde y cómo aparece |
|---|---|
| Teléfonos | Pie y botones: `tel:+34828661940` (132 páginas) y `tel:+34665288269` (133), bien como enlaces `tel:` ✅. **JSON-LD y `llms.txt`: solo el primero** |
| Dirección, pie | «Calle Domingo Monteverde 144 Bajo A, Playa de Arinaga 35118. Las Palmas de Gran Canaria» |
| Dirección, JSON-LD | «Calle Domingo Monteverde 144 Bajo A», `35118`, «Las Palmas de Gran Canaria» (sin «Playa de Arinaga») |
| Dirección, `llms.txt` | «…, 35118 Las Palmas de Gran Canaria, España» |
| Dirección, textos legales | «35118 PLAYA DE ARINAGA LAS PALMAS (Las Palmas…)» |
| Nombre | «Asegura-Te» (744), «ASEGURA-TE» (143), «Aseguratte» (JSON-LD y dominio), «Asegurate» (134, `alt` del logo), «Asegura-Te Correduría de Seguros SL» (legal) |
| Email | `info@aseguratte.es` y `direccion@aseguratte.es` |
| WhatsApp | `api.whatsapp.com/send?phone=34665288269&app=facebook&…` (M6) |
| Coordenadas | Ya existen en `schema.ts`: 27.8609851, -15.4011986 (cae en Playa de Arinaga) |

**El NAP no es idéntico.** Dirección y nombre se escriben de cuatro formas. El dato de coordenadas apoya la duda del prompt (decisión 1).

---

## 6. Indexación

| Elemento | Estado |
|---|---|
| `robots.txt` | ✅ `Allow: /`, sitemap absoluto con `www`, no bloquea CSS/JS/imágenes. ⚠️ M10 |
| Sitemap | ✅ `sitemap-index.xml` → `sitemap-0.xml`, `Content-Type: application/xml`, 65 URLs que existen. ❌ sin `lastmod`; ⚠️ incluye 4 legales y los 3 artículos futuros |
| Sitemap «Desconocido» en Search Console | El `Content-Type` es correcto. Hay que verificar que la propiedad sea exactamente `https://www.aseguratte.es/` (C2 puede estar causándolo) |
| Duplicados | ❌ C1, C2, `/index.html` y `/cookies/index.html` |
| Legales | ⚠️ A3 / decisión 4 |
| Entorno no productivo | No existe `SITE_ENV` ni mecanismo. No hay `noindex` por entorno. Ninguna URL absoluta apunta a localhost |
| Enlaces internos rotos (en `dist/`) | ❌ `/contacto.html` (31 páginas) y el enlace de miga a `/seguro-las-palmas/` (25). El `/contactotrabajo.php` del pie está dentro de un comentario HTML, no es un enlace |
| Huérfanos | **No comprobado** con un rastreo de enlaces. El listado del blog se carga por JavaScript, así que un rastreador sin JS no ve los artículos desde `/blog/` (solo por el sitemap y el JSON-LD `Blog`) |

---

## 7. `llms.txt`

| Pregunta | Respuesta |
|---|---|
| ¿Existe? | ✅ `public/llms.txt`, 200 `text/plain` en producción |
| ¿Se genera en el build? | ❌ Está escrito a mano (`public/`) |
| ¿Está al día? | ✅ Hoy: 25 ramos y 32 artículos, igual que `dist/` |
| ¿NAP y servicios? | ⚠️ Un solo teléfono; dirección sin «Playa de Arinaga» |
| ¿Enlaces resuelven? | ✅ Todos con `www` y con barra |
| ¿Contiene lo que no debería? | ⚠️ Lista los 4 legales y los 3 artículos futuros; contiene las afirmaciones de la sección 4 |

---

## 8. Decisiones que son tuyas

| # | Decisión | Opciones | Impacto |
|---|---|---|---|
| 1 | **Localidad de la dirección** | (a) «Las Palmas de Gran Canaria» como hoy; (b) «Agüimes» + «Playa de Arinaga» (el código postal 35118 y las coordenadas lo respaldan); (c) calle + «Playa de Arinaga, Agüimes» y `areaServed` en Las Palmas | Debe coincidir con Google Business Profile. Afecta al NAP, al JSON-LD y a `llms.txt`. No lo decido yo |
| 2 | **`areaServed`** | Qué municipios se declaran (Plausible sugiere Las Palmas, Vecindario, Telde, Ingenio y Arrecife) | Solo declaramos lo que la correduría atiende de verdad. Hoy: Las Palmas, Gran Canaria, Islas Canarias |
| 3 | **Política de URL** | Mantener `www` y barra final (lo que ya hace el servidor para las páginas) | Recomiendo mantener: solo hay que alinear el canonical del blog (C1) y forzar HTTPS y un único host (C2) |
| 4 | **Legales** | (a) `noindex, follow` y fuera del sitemap; (b) dejarlas indexables | (a) evita que `/politica-privacidad/` (2.ª página de entrada en Plausible) reciba tráfico de búsqueda que no es una consulta de seguros. Riesgo de (b): son páginas sin contenido útil para el buscador que ocupan sitio en el índice y en el sitemap. Requiere M3 |
| 5 | **Legado** | Las URLs viejas dan 404. Opciones: dejar 404, 301 a la equivalente (`/contacto.html` → `/contacto/`, `/politicadeprivacidad.html` → `/politica-privacidad/`, `/landings/asistencia.html` → `/asistencia/`, `/index.html` → `/`), o 410 | 301 conserva visitas antiguas (no están medidas por URL en el informe). `/blog2/` y `/datacard/*.html`: dime si siguen vigentes |
| 6 | **Crawlers de IA** | Hoy `robots.txt` los permite todos | ChatGPT trae visitas con 8% de rebote. Recomiendo mantener |
| 7 | **Datos que faltan** | Horario, año de fundación, número de registro DGSFP | Las coordenadas ya están. Sin dato, la propiedad se omite |
| 8 | **CTA de los artículos** (C3) | Cambiar el `link` de 31 artículos a `/contacto/`, o redirigir `/contacto.html` → `/contacto/` | Es lo más urgente y lo más barato. La redirección lo arregla sin tocar el contenido |
| 9 | **Campo `seoTitle`** | Añadirlo al esquema del blog o dejar los H1 como están | Ver `docs/SEO-METAS-PROPUESTAS.md` |
| 10 | **Perfiles sociales** (M7) | ¿Se incluyen en `sameAs` el LinkedIn personal y el Facebook móvil, o se usan las páginas de empresa? | `sameAs` lleva solo perfiles de la entidad |
| 11 | **Artículos con fecha futura** (M9) | Mantenerlos publicados o ocultarlos hasta su fecha | Si son programados, hoy ya son públicos |

---

## 9. Lo que no he podido comprobar

- Rich Results Test y Schema Validator (hay que pasarlos a mano, una URL por plantilla).
- PageSpeed / Core Web Vitals.
- Search Console (propiedad, estado del sitemap, páginas indexadas).
- El motivo del 100% de rebote de `salud` en un navegador real.
- Si producción coincide con el repo: la home de producción es del 2026-09-28.

## 10. Siguiente paso

Si apruebas, la Fase 2 empieza por lo crítico y barato, en este orden: C3 (`/contacto.html`), C1 (canonical del blog), C2 (`.htaccess` con HTTPS y host único) y A1 (migas). Dime qué decisiones de la sección 8 tomas y confirma la Fase 2.
