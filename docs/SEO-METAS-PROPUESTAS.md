# Propuestas de metas del blog (NO aplicadas)

Fecha: 2026-11-12 · Fase 1 de la auditoría SEO. **No se ha tocado ningún archivo de contenido.** Hay que aprobar el criterio antes de aplicar nada.

## Por qué hay que tocar algo

Medido sobre el build (`dist/`) de los 32 artículos:

| Medida | Resultado |
|---|---|
| `<title>` ≤ 60 caracteres | **2 de 32** |
| `<title>` > 80 caracteres | **20 de 32** (máximo 117) |
| `description` entre 150 y 160 | 8 de 32 |
| `description` < 150 | 24 de 32 (mínimo 66: `placas-solares-seguros`) |
| `description` repetida | `aseguradora-rechaza-siniestro` = `quien-puede-ayudarte-siniestro` |

**Causa.** El `<title>` del artículo es su `title` del frontmatter (el mismo que se pinta como H1, sin el emoji inicial) más ` | Asegura-Te`, que añade `Layout.astro`. Como los H1 son preguntas largas, el title tag sale largo y Google lo recorta.

**Para acortar el title tag sin tocar el H1** hace falta un campo opcional nuevo en `src/content.config.ts` (por ejemplo `seoTitle`) y una línea en `[...slug].astro`. Es un cambio de código, no de contenido. La otra vía es cambiar el H1, que la regla 6 prohíbe sin tu OK.

## Propuestas para los artículos prioritarios

Los tres que pierden al lector en segundos (Plausible) y el que tiene la `description` más corta. Todas las longitudes están medidas.

### `responsabilidad-civil`

| | Actual | Propuesta |
|---|---|---|
| Title tag | ¿Qué cubre (y qué no) la responsabilidad civil en tus seguros? \| Asegura-Te (**75**) | Qué cubre la responsabilidad civil y qué no \| Asegura-Te (**56**) |
| Description | Entiende qué cubre la responsabilidad civil en tus seguros, en qué situaciones actúa y por qué es una de las coberturas más importantes. (**136**) | Qué cubre la responsabilidad civil de tus seguros, qué excluye y qué tipos existen. Revisa si tu cobertura es suficiente con Asegura-Te en Las Palmas. (**150**) |

Encaje con la página: el artículo tiene secciones «¿Qué es?», «Ejemplos reales», «¿Qué NO cubre?», «Tipos» y «¿Tengo suficiente?». La propuesta promete exactamente eso.

### `trabajas-desde-casa-seguro`

| | Actual | Propuesta |
|---|---|---|
| Title tag | ¿Trabajas desde casa? Tu seguro puede no cubrir todo lo que imaginas \| Asegura-Te (**81**) | Seguro de hogar y teletrabajo: ¿qué cubre? \| Asegura-Te (**55**) |
| Description | Se mantiene (156, dentro del rango y sin promesas) | — |

Encaje: el cuerpo trata si el seguro de hogar cubre teletrabajo, equipos y mercancías. La consulta que debería responder es «seguro de hogar teletrabajo».

### `cambiar-de-seguro`

| | Actual | Propuesta |
|---|---|---|
| Title tag | ¿Puedo cambiar de compañía si ya tengo un seguro activo? \| Asegura-Te (**69**) | ¿Cambiar de aseguradora con un seguro activo? \| Asegura-Te (**58**) |
| Description | ¿Puedes cambiar de aseguradora con una póliza activa? Sí, y **puede ahorrarte dinero**. Te explicamos cuándo y cómo hacerlo sin errores. (**132**) | ¿Puedes cambiar de aseguradora con la póliza en vigor? Te explicamos plazos, qué pasa si ya se renovó y cómo hacerlo sin quedarte sin cobertura. Asegura-Te. (**156**) |

**Problema real:** la description actual afirma un ahorro. Es una promesa de precio en un sector YMYL (regla 2) y el artículo no lo demuestra. La propuesta la quita y usa las secciones que sí existen («¿Cuándo puedo cambiar?», «¿Qué pasa si ya se renovó?»).

### `placas-solares-seguros`

| | Actual | Propuesta |
|---|---|---|
| Title tag | Placas solares y seguros \| Asegura-Te (**37**) | Seguro para placas solares: qué comunicar \| Asegura-Te (**54**) |
| Description | Placa solares seguros, lo que debes saber para cuidar tu inversión (**66**, con errata «Placa solares») | ¿Están cubiertas tus placas solares por el seguro de hogar? Qué comunicar a tu aseguradora, qué daños pueden sufrir y qué coberturas revisar. Asegura-Te. (**153**) |

Encaje: el artículo (196 palabras) tiene «¿Están cubiertas automáticamente?», «¿Por qué es importante comunicarlo?», «¿Qué daños pueden sufrir?» y «Coberturas importantes».

## Pendiente

Los otros 28 artículos siguen el mismo patrón de fallo. No los reescribo hasta que apruebes:

1. el campo `seoTitle` (o, si prefieres, cambiar los H1);
2. el criterio (title ≤ 60 con la consulta principal, description de 150 a 160 sin promesas);
3. estas cuatro propuestas como modelo.

Revisa también `aseguradora-rechaza-siniestro` y `quien-puede-ayudarte-siniestro`: comparten description y compiten por la misma consulta.
