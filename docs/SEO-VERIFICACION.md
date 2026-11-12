# Verificación SEO (`npm run seo:check`)

Generado el 2026-11-12 sobre `dist` (68 páginas HTML, 61 indexables, 61 URLs en el sitemap).

**Resultado: ✅ PASA** · ✅ 29428 comprobaciones correctas · ⚠️ 91 avisos · ❌ 0 errores

Un **error** es un fallo técnico y hace fallar el build. Un **aviso** es calidad de contenido que decide una persona (longitud de title/description, afirmaciones comerciales) y no lo hace fallar salvo con `--strict`.

## Matriz

| Comprobación | ✅ | ⚠️ | ❌ |
|---|---:|---:|---:|
| Canonical absoluto, con `www`, igual a la propia URL y existente (`canon`) | 261 |  |  |
| `.htaccess` con HTTPS, host único y `/index.html` → `/` (`htaccess`) | 5 |  |  |
| JSON-LD válido, un solo bloque, `@id` resueltos, sin vacíos ni tipos prohibidos (`ld`) | 17349 |  |  |
| `InsuranceAgency` presente e idéntica en todas las páginas (`ld.agency`) | 130 |  |  |
| `BreadcrumbList` en todas las páginas menos la home (`ld.bc`) | 65 |  |  |
| JSON-LD sin promesas de precio, ahorro o «lo mejor» (`ld.claims`) | 2186 | 2 |  |
| Cada ramo tiene `Service` con `areaServed` y `provider` (`ld.service`) | 25 |  |  |
| Enlaces internos que resuelven, sin `.html`/`.php`/`index.html` ni localhost (`links`) | 6247 |  |  |
| `llms.txt` existe y sus enlaces resuelven a páginas indexables (`llms`) | 121 |  |  |
| Todos los ramos y artículos indexables están en `llms.txt` (`llms.cover`) | 57 |  |  |
| `meta description` presente (`meta.desc`) | 68 |  |  |
| `meta description` de 150 a 160 caracteres (`meta.desc.len`) | 11 | 50 |  |
| `meta description` única (`meta.desc.uniq`) | 61 |  |  |
| Un solo `<h1>` (`meta.h1`) | 62 | 6 |  |
| `<html lang="es">` (`meta.lang`) | 68 |  |  |
| `<title>` presente (`meta.title`) | 68 |  |  |
| `<title>` ≤ 60 caracteres (`meta.title.len`) | 28 | 33 |  |
| `<title>` único (`meta.title.uniq`) | 61 |  |  |
| NAP idéntico entre site.ts, JSON-LD, pie, contacto y llms.txt (`nap`) | 985 |  |  |
| `noindex` exactamente donde corresponde (legales, datacards, 404) (`noindex`) | 69 |  |  |
| Open Graph y Twitter completos (`og`) | 854 |  |  |
| `og:image` existe y sus dimensiones y tipo declarados son los reales (`og.img`) | 244 |  |  |
| `robots.txt` correcto (`robots`) | 5 |  |  |
| Sitemap coherente con las páginas indexables (`sitemap`) | 398 |  |  |

## Avisos

### `meta.h1` — Un solo `<h1>` (6)

- `/aviso-legal/` — sin <h1> (página noindex)
- `/cookies/` — sin <h1> (página noindex)
- `/datacard/lidia/` — sin <h1> (página noindex)
- `/datacard/oficina/` — sin <h1> (página noindex)
- `/politica-privacidad/` — sin <h1> (página noindex)
- `/politica-privacidad-redes/` — sin <h1> (página noindex)

### `meta.desc.len` — `meta description` de 150 a 160 caracteres (50)

- `/asistencia/` — description de 140 caracteres
- `/blog/aseguradora-no-renueva-poliza/` — description de 144 caracteres
- `/blog/aseguradora-rechaza-siniestro/` — description de 134 caracteres
- `/blog/cambiar-de-seguro/` — description de 132 caracteres
- `/blog/cierre-asegurado/` — description de 144 caracteres
- `/blog/como-comunicar-un-siniestro/` — description de 125 caracteres
- `/blog/como-elegir-el-mejor-seguro-para-tu-familia/` — description de 138 caracteres
- `/blog/como-rellenar-un-parte-amistoso/` — description de 140 caracteres
- `/blog/estas-pensando-en-cambiar-de-seguro-de-salud/` — description de 139 caracteres
- `/blog/` — description de 135 caracteres
- `/blog/inquilino-propietario/` — description de 136 caracteres
- `/blog/placas-solares-seguros/` — description de 66 caracteres
- `/blog/por-que-contratar-un-seguro/` — description de 149 caracteres
- `/blog/que-coberturas-son-imprescindibles/` — description de 136 caracteres
- `/blog/reforma-vivienda-seguro-hogar/` — description de 144 caracteres
- `/blog/regala-tranquilidad/` — description de 147 caracteres
- `/blog/renovacion-seguro-salud/` — description de 147 caracteres
- `/blog/responsabilidad-civil/` — description de 136 caracteres
- `/blog/revisa-tu-seguro/` — description de 138 caracteres
- `/blog/seguro-de-viaje-imprescindible/` — description de 115 caracteres
- `/blog/seguro-mascota-protegida/` — description de 144 caracteres
- `/blog/seguros-para-autonomos/` — description de 149 caracteres
- `/blog/seguros-patinetes-electricos/` — description de 136 caracteres
- `/blog/seguros-que-no-puedes-olvidar/` — description de 144 caracteres
- `/blog/vender-coche-seguro-tramites/` — description de 144 caracteres
- `/contacto/` — description de 145 caracteres
- `/` — description de 146 caracteres
- `/seguro-las-palmas/accidentes-convenios/` — description de 137 caracteres
- `/seguro-las-palmas/accidentes-individual/` — description de 149 caracteres
- `/seguro-las-palmas/autos/` — description de 149 caracteres
- `/seguro-las-palmas/baja-laboral/` — description de 124 caracteres
- `/seguro-las-palmas/ciclomotores/` — description de 137 caracteres
- `/seguro-las-palmas/comercios/` — description de 119 caracteres
- `/seguro-las-palmas/decesos/` — description de 145 caracteres
- `/seguro-las-palmas/defensa-juridica/` — description de 128 caracteres
- `/seguro-las-palmas/defensa-juridica-empresa/` — description de 147 caracteres
- `/seguro-las-palmas/embarcaciones/` — description de 122 caracteres
- `/seguro-las-palmas/flotas/` — description de 130 caracteres
- `/seguro-las-palmas/hogar/` — description de 125 caracteres
- `/seguro-las-palmas/mascotas/` — description de 112 caracteres
- … y 10 más

### `meta.title.len` — `<title>` ≤ 60 caracteres (33)

- `/blog/alquiler-vivienda-vacacional-siniestro/` — title de 82 caracteres
- `/blog/aseguradora-no-renueva-poliza/` — title de 117 caracteres
- `/blog/aseguradora-rechaza-siniestro/` — title de 63 caracteres
- `/blog/beneficiarios-seguro-de-vida/` — title de 101 caracteres
- `/blog/cambiar-de-seguro/` — title de 69 caracteres
- `/blog/como-comunicar-un-siniestro/` — title de 85 caracteres
- `/blog/como-elegir-el-mejor-seguro-para-tu-familia/` — title de 66 caracteres
- `/blog/como-rellenar-un-parte-amistoso/` — title de 85 caracteres
- `/blog/estas-pensando-en-cambiar-de-seguro-de-salud/` — title de 95 caracteres
- `/blog/fenomenos-atmosfericos-seguro-consorcio/` — title de 95 caracteres
- `/blog/inquilino-propietario/` — title de 87 caracteres
- `/blog/objetos-valor-casa/` — title de 67 caracteres
- `/blog/por-que-contratar-un-seguro/` — title de 81 caracteres
- `/blog/que-coberturas-son-imprescindibles/` — title de 88 caracteres
- `/blog/quien-puede-ayudarte-siniestro/` — title de 83 caracteres
- `/blog/reforma-vivienda-seguro-hogar/` — title de 85 caracteres
- `/blog/regala-tranquilidad/` — title de 90 caracteres
- `/blog/renovacion-seguro-salud/` — title de 98 caracteres
- `/blog/responsabilidad-civil/` — title de 75 caracteres
- `/blog/revisa-tu-seguro/` — title de 80 caracteres
- `/blog/seguro-de-coche-no-cubre/` — title de 76 caracteres
- `/blog/seguro-de-viaje-imprescindible/` — title de 88 caracteres
- `/blog/seguro-mascota-protegida/` — title de 84 caracteres
- `/blog/seguros-para-autonomos/` — title de 62 caracteres
- `/blog/seguros-patinetes-electricos/` — title de 73 caracteres
- `/blog/seguros-que-no-puedes-olvidar/` — title de 85 caracteres
- `/blog/tener-un-seguro-de-vida/` — title de 63 caracteres
- `/blog/tormenta-coche-seguro-consorcio/` — title de 97 caracteres
- `/blog/trabajas-desde-casa-seguro/` — title de 81 caracteres
- `/blog/vender-coche-seguro-tramites/` — title de 90 caracteres
- `/seguro-las-palmas/accidentes-convenios/` — title de 63 caracteres
- `/seguro-las-palmas/defensa-juridica-empresa/` — title de 67 caracteres
- `/seguro-las-palmas/pias/` — title de 68 caracteres

### `ld.claims` — JSON-LD sin promesas de precio, ahorro o «lo mejor» (2)

- `/blog/cambiar-de-seguro/` — afirmación comercial en JSON-LD (description): «¿Puedes cambiar de aseguradora con una póliza activa? Sí, y puede ahorrarte dinero. Te exp»
- `/blog/cambiar-de-seguro/` — afirmación comercial en JSON-LD (description): «¿Puedes cambiar de aseguradora con una póliza activa? Sí, y puede ahorrarte dinero. Te exp»
