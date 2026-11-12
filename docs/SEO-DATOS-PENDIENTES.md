# Datos pendientes para SEO

Fecha: 2026-11-12 · Fase 2. Estos datos **no están en la web ni en el repo**. Mientras no existan, la propiedad se omite (no se inventa). Cuando los tengas, se rellenan en `src/config/site.ts`.

| Dato | Campo en `site.ts` | Se usará en | Notas |
|---|---|---|---|
| Horario de apertura | `openingHours` | JSON-LD `openingHoursSpecification` | Formato `['Mo-Fr 09:00-18:00']`. Debe coincidir con Google Business Profile |
| Año de fundación | `foundingDate` | JSON-LD `foundingDate` | La web dice «+20 años» (sin año). No se calcula un año a partir de eso |
| Nº de registro DGSFP | `dgsfpRegistration` | Solo si la web debe mostrarlo | Hoy no aparece en la web. Mostrarlo en el pie y en JSON-LD refuerza la confianza (sector regulado), pero es decisión tuya |

## Decisiones tomadas (2026-11-12)

| Dato | Decisión |
|---|---|
| `address.addressLocality` | Playa de Arinaga |
| `areaServed` | Islas Canarias y España |
| `sameAs` | Facebook, Instagram, LinkedIn y TikTok |

## Todavía por confirmar

| Dato | Estado |
|---|---|
| NAP visible | El pie dice «…Playa de Arinaga 35118. Las Palmas de Gran Canaria»; `llms.txt` dice «35118 Las Palmas de Gran Canaria»; los textos legales, «35118 PLAYA DE ARINAGA LAS PALMAS». El JSON-LD ya usa Playa de Arinaga. Hay que decidir el texto visible único y alinear pie, legales y `llms.txt` |
| `geo` | Coordenadas que ya estaban en el JSON-LD (27.8609851, -15.4011986): confirmar que son las del local |
| `email` | `info@aseguratte.es`. Los textos legales usan además `direccion@aseguratte.es` |
| LinkedIn | Es un perfil personal (`/in/…`) |
