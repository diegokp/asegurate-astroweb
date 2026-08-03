---
name: blog-nueva-publicacion
description: Crear una o varias publicaciones de blog para ASEGURA-TE a partir
  del texto e imagen enviados por el cliente por correo. Usar cuando el usuario
  pegue contenido de un correo con fecha de publicación para el blog.
---

# Nueva publicación de blog — ASEGURA-TE

Destino en el repo: `.claude/skills/blog-nueva-publicacion/SKILL.md`

Por cada publicación detectada en el contenido pegado, sigue estos pasos en orden.

## Stack y ubicación de archivos

- Astro con content collection de blog.
- Markdown de cada post: `src/content/blog/{slug}.md`
- JSON que consume el front vía `fetch` client-side: `public/api/data.json`
- Imágenes: `public/images/blog/{slug}.webp` — el proyecto usa `.webp`. Si la imagen que
  llega del cliente viene en otro formato (`.png`, `.jpg`...), conviértela primero;
  `sharp` está disponible como dependencia interna de Astro (no requiere instalación
  aparte) y es la forma más simple de hacerlo desde Node.

## 1. Markdown — `src/content/blog/{slug}.md`

Frontmatter exacto:

```yaml
title: string        # con emoji inicial, tono cercano/pregunta al lector
slug: string          # kebab-case sin tildes, igual al nombre de archivo
image: /images/blog/{slug}.webp
imageAlt: "imagen de {resumen breve en minúsculas}"
excerpt: "Publicado el {DD} {mes en minúsculas} {YYYY}"   # día siempre a 2 dígitos
description: "string de 150-160 caracteres, SEO, menciona ASEGURA-TE"
publishDate: YYYY-MM-DD
link: /contacto.html
last: true             # ver paso 3 antes de fijar esto
clasificacion: ["#Hashtag1", "#Hashtag2", "..."]  # PascalCase, 3-7 etiquetas
```

Cuerpo: mismo tono y estructura que las publicaciones anteriores — títulos `###` con
emoji, párrafos cortos, listas con `✔️`, separadores `---`, bloque final de contacto
(teléfono, WhatsApp, email, web) y frase de cierre en negrita. Toma un post existente
del repo (`src/content/blog/`) como referencia de estilo antes de escribir.

## 2. Imagen

Guarda/optimiza la imagen adjunta en `public/images/blog/{slug}.webp`. El proyecto usa
`.webp` para todas las imágenes de blog — si llega en otro formato, conviértela (ver
sección de stack arriba) antes de guardarla; no dejes `.png`/`.jpg` sueltos en esta carpeta.

## 3. Campo `last`

Busca en `src/content/blog/*.md` el archivo que actualmente tiene `last: true` y
cámbialo a `false`. Pon `last: true` únicamente en el post con `publishDate` más
reciente del lote que estás creando ahora.

⚠️ Esta lógica está inferida de cómo `src/pages/blog/index.astro` consulta la
collection (`data.last == true` para el post destacado) — confírmala con el
desarrollador si algo no coincide antes de confiar en ella a ciegas.

## 4. Actualizar `public/api/data.json`

`data.json` es un **subconjunto** del frontmatter del markdown — no una copia completa.
Añade un objeto por publicación al final del array, con **únicamente** estos campos:

```json
{
  "id": "{siguiente id como string}",
  "title": "...",
  "slug": "...",
  "image": "...",
  "imageAlt": "...",
  "excerpt": "...",
  "publishDate": "...",
  "clasificacion": ["..."]
}
```

**NO** incluyas `description`, `link` ni `last` — esos campos existen solo en el
markdown, para renderizar la página individual del post; no están presentes en
ninguna entrada actual de `data.json`.

Ruta completa del archivo: `public/api/data.json`.

## Convenciones de datos (checklist antes de dar por terminado un post)

- **`slug`**: kebab-case, sin tildes, igual al nombre de archivo y al campo `slug`
  del frontmatter.
- **`id` en `data.json`**: string, no número (`"27"`, no `27`). Es el siguiente
  entero tras el `id` máximo existente en el array — revisa el array completo, no
  asumas que está ordenado.
- **`clasificacion`**: array de hashtags en PascalCase (sin espacios), con tildes
  cuando corresponda, ej. `"#SegurosConCercanía"`.
- **`excerpt`**: `"Publicado el {DD} {mes en minúsculas} {YYYY}"`, con el día siempre
  a dos dígitos (`"01 agosto 2026"`, no `"1 agosto 2026"`). El histórico tiene
  inconsistencias en esto — no las repliques en publicaciones nuevas.
- **Programación**: el sitio permite `publishDate` futuro y lo filtra en el fetch
  client-side (solo se muestran posts con `publishDate` ya alcanzado). No hace falta
  esperar al día exacto para hacer commit — se puede subir el lote completo en cuanto
  llega del cliente.

## 5. Validar antes de mostrar el diff

- `npm run build` debe pasar sin errores.
- El `id` nuevo debe ser único y consecutivo respecto al máximo existente.
- El día del `excerpt` debe coincidir con el día de `publishDate`.
- La imagen referenciada existe realmente en `public/images/blog/` y es `.webp`.

## 6. Confirmación antes de commitear

Muestra el diff completo (markdown nuevo, imagen, cambios en `data.json`) y espera
aprobación explícita del usuario antes de `git add` / `git commit`. No hagas `git push`
sin confirmación.

Mensaje de commit: `blog: agrega publicación {slug}`
(o `blog: agrega N publicaciones` si el correo trae varias a la vez).
