# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at localhost:4321
npm run build     # astro check + build to ./dist/
npm run preview   # Preview production build locally
```

`@astrojs/tailwind` is installed with `--legacy-peer-deps` because the package declares peer deps for Astro ≤5 but the project uses Astro 6. Use this flag when updating or reinstalling it.

## Architecture

**Stack**: Astro 6 · Vue 3 · Tailwind CSS v3 · TypeScript. `~` is an alias for `src/`.

### Page types and URL structure

- `src/pages/index.astro` — homepage
- `src/pages/seguro-las-palmas/*.astro` — one page per insurance product (25+ pages), all follow the same structure: `Layout` > `SegurosPage` component > `ContactForm` > `SegurosLink` navigation
- `src/pages/blog/index.astro` — blog listing
- `src/pages/blog/[...slug].astro` — dynamic blog post route, driven by the `blog` content collection

### Layout and SEO

`src/layouts/Layout.astro` accepts `title`, `description`, `canonicalURL?`, `ogImage?`, `ogType?`. It emits a global JSON-LD block (`InsuranceAgency` + `WebSite`, built from `src/utils/schema.ts`) via the reusable `<JsonLd data={...} />` component. A `<slot name="head" />` lets individual pages inject additional page-specific JSON-LD the same way:

```astro
<Layout title="..." description="..." canonicalURL={url}>
  <JsonLd data={jsonLd} slot="head" />
  ...
</Layout>
```

All pages pass an explicit `canonicalURL` and have non-empty `title`/`description` — none rely on the Layout fallback anymore except when a value is intentionally left generic.

**`src/utils/schema.ts`** is the single source of truth for structured data. Exports:
- `siteURL` (always `https://www.aseguratte.es` — **with `www`**; every JSON-LD `@id` and canonical must use this exact host, mismatching www/non-www breaks entity linking between the global `InsuranceAgency`/`WebSite` and page-level `Service`/`WebPage` nodes).
- `AGENCY_ID`, `WEBSITE_ID` — stable `@id` constants referenced across the whole site.
- `buildAgencySchema()`, `buildWebsiteSchema()` — used once, globally, by `Layout.astro`.
- `buildServiceSchema({ pageURL, name, description, serviceType, breadcrumbName, faqs? })` — used by all `seguro-las-palmas/*` pages (`Service` + `BreadcrumbList`, plus `FAQPage` only if `faqs` is non-empty).
- `buildWebPageSchema({ pageURL, name, description?, breadcrumb })` — generic `WebPage` + `BreadcrumbList`, used by `contacto`, `asistencia`, and the legal pages.

`src/components/seo/JsonLd.astro` is the reusable component (`<script type="application/ld+json">` wrapper) — use it instead of hand-writing the script tag.

`src/components/seo/FaqSection.astro` exists (renders an accessible `<details>/<summary>` FAQ block from the same `faqs` array passed to `buildServiceSchema`) but is **currently unused** on any page — it was added and then deliberately removed from the 10 product pages that had it at the client's request. If FAQ content is reintroduced, always pair the visible `<FaqSection>` with the `FAQPage` JSON-LD from the same `faqs` array — never ship `FAQPage` schema without matching visible content (Google penalizes mismatched structured data).

### Semantic HTML

Every page must render exactly **one** `<main>`. Watch for these known trip points:
- `contactForm.astro`'s root wrapper is a `<div>` (not `<main>`) — it's embedded inside pages that already have their own `<main>` from `SegurosPage.astro`/`BlogPage.astro`.
- `header.astro`'s products dropdown (`#productsNav`) is a `<nav aria-label="Productos">`, not `<main>` — it's a navigation flyout, not page content.
- `.overlayProducts` (the dropdown panel) is `position: absolute` and depends on the explicit `left:0; right:0; margin:auto` rule in `src/styles/index.css` to stay centered — don't remove those without checking the visual result, the centering isn't implicit from its ancestors.

### robots.txt and llms.txt

Both live in `public/` (static, not generated). `robots.txt` explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) per client decision, and disallows `/api/` and `/datacard/`. `llms.txt` lists every real page grouped by category — if you add/remove/rename a page, keep it in sync (nothing validates it automatically).

### Content collections

Blog posts live in `src/content/blog/*.md`. Schema defined in `src/content.config.ts`:

| Field | Notes |
|---|---|
| `title` | May include leading emoji — strip with regex before meta/JSON-LD use |
| `last` | `true` = featured post shown first; `false` = regular post. Exactly one post should have `last: true` at any time |
| `description` | Optional; falls back to a generated string |
| `publishDate` | Coerced to `Date` |
| `link` | External or internal CTA link on the post card |

Post images live at `public/images/blog/{slug}.webp` — **the project standardized on `.webp`** (converted from a mix of `.png`/`.webp` in 2026-08; if you ever add a non-webp image, convert it first, e.g. with `sharp`, which is already available transitively via Astro's own dependency tree, no install needed).

**Important, non-obvious architecture**: the blog listing at `/blog/` does **not** render from the content collection. `src/components/articulos.vue` (`client:only="vue"`) fetches `https://raw.githubusercontent.com/diegokp/asegurate-astroweb/main/public/api/data.json` at runtime — a manually-maintained JSON snapshot, kept in sync by hand, that duplicates a *subset* of the frontmatter (`id`, `title`, `slug`, `image`, `imageAlt`, `excerpt`, `publishDate`, `clasificacion` — no `description`/`link`/`last`). `src/pages/api/post.json.ts` is a local Astro endpoint that reads the *actual* content collection but is currently **not used by anything** — it's dead code, left over from before this fetch-from-GitHub pattern existed. Any change to a blog post's `image`, `title`, `excerpt`, etc. must be mirrored in `public/api/data.json` or it won't show up on `/blog/` (it will still work on the post's own `/blog/{slug}/` page, which does read the real collection). See the `blog-nueva-publicacion` skill for the full new-post workflow.

### Vue components

Interactive components use `client:only="vue"` hydration. Static product data lives in `src/components/data/productos.json`, `preguntas.json`, and `productosList.json`.

### Tailwind

`tailwind.config.mjs` uses ESM imports. The `@tailwindcss/typography` plugin is active; `prose max-w-none` is the class used in blog and insurance page content areas.
