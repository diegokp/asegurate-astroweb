# llms.txt — Fase 5

Fecha: 2026-11-12. Skill `geo-llmstxt` aplicada como lista de comprobación del formato (H1, cita de menos de 200 caracteres, secciones H2, URLs absolutas, Datos clave y Contacto).

## Cómo se genera

[src/integrations/llms-txt.ts](../src/integrations/llms-txt.ts) escribe `dist/llms.txt` al terminar cada build, leyendo el HTML ya renderizado. Se eliminó `public/llms.txt` (estaba escrito a mano).

| Sección | Origen |
|---|---|
| `# Asegura-Te` y cita | `site.name`; resumen fijo y factual |
| Servicios (25 ramos en 5 grupos) | `Service` del JSON-LD de cada ramo: nombre y descripción (máx. 30 palabras). Sin promesas: ya se retiraron del JSON-LD en la Fase 3 |
| Guías (32 artículos) | `BlogPosting` de cada artículo, del más reciente al más antiguo. Solo el título |
| Contacto y Datos clave | `src/config/site.ts`: mismo dato que el JSON-LD. Dirección tal como la escribió el cliente: «Calle Domingo Monteverde 144 Bajo A, Playa de Arinaga 35118. Las Palmas de Gran Canaria» |

Sin páginas legales ni datacards ni URLs antiguas. Los 59 enlaces llevan `www` y barra final. El build avisa si un enlace no resuelve, apunta a una página `noindex` o hay un ramo sin grupo.

Cambios respecto al archivo anterior: salen las 4 legales; desaparecen «sin coste para el cliente», «Comparamos coberturas y precios», «sin listas de espera» y «más de 20 años»; el teléfono de WhatsApp y el segundo teléfono pasan a aparecer en Contacto.

## `llms-full.txt`

No compensa. El sitio tiene 25 ramos de texto corto y artículos; un `llms-full.txt` repetiría el contenido de las páginas, que ya son legibles, y habría que mantenerlo sin evidencia de que lo lean los buscadores o asistentes de IA. Si más adelante hay un uso concreto, el generador puede ampliarse.

## Nota honesta

`llms.txt` no es un estándar adoptado por los grandes buscadores. Es barato de mantener (ahora, automático) y no sustituye al resto del SEO.

## Pendiente

- Los textos legales (que ya no están en `llms.txt`) siguen usando otras variantes de la dirección y del nombre. No se han tocado por ser texto del cliente.
- La cita y las descripciones de ramo siguen hablando de «Las Palmas» porque así lo dicen las páginas.
