# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at localhost:4321
npm run build     # astro check + build to ./dist/, then `postbuild` runs seo:check (SEO errors fail the build)
npm run seo:check # SEO verification of ./dist (build first); writes docs/SEO-VERIFICACION.md; `-- --strict` makes warnings fail too
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

`src/layouts/Layout.astro` accepts `title`, `description`, `canonicalURL?`, `ogImage?` (+ `ogImageMeta?`, `ogImageAlt?`), `ogType?`, `robots?` (default `index, follow`; with `noindex` and no `canonicalURL` no canonical is emitted), `schema?` and `jsonLd?` (`false` = no JSON-LD, used by the 404). It emits **one** `<script type="application/ld+json">` per page with a single `@graph`: `[InsuranceAgency, WebSite, ...schema["@graph"]]`. Pages never write the script tag: they build their nodes with the helpers in `schema.ts` and pass them in:

```astro
const jsonLd = buildServiceSchema({ pageURL, name, description, serviceType, breadcrumbName });
<Layout title="..." description="..." canonicalURL={pageURL} schema={jsonLd}>
```

All pages pass an explicit `canonicalURL` **with trailing slash** (that is what the host serves; the no-slash form 301-redirects) and non-empty `title`/`description`.

**`src/config/site.ts`** is the single source of company data (name, address, phones, email, social profiles, `areaServed`, geo, OG image with real dimensions). Never hard-code NAP elsewhere. Missing facts (opening hours, founding year, DGSFP number) are listed in `docs/SEO-DATOS-PENDIENTES.md` and omitted from JSON-LD, never invented. Decisions taken 2026-11-12: address locality = Playa de Arinaga; `areaServed` = Islas Canarias + España; `sameAs` = Facebook, Instagram, LinkedIn, TikTok.

**`src/utils/schema.ts`** is the single source of truth for structured data. Exports:
- `siteURL` (always `https://www.aseguratte.es` — **with `www`**; every JSON-LD `@id` and canonical must use this exact host), `AGENCY_ID`, `WEBSITE_ID`.
- `buildAgencySchema()`, `buildWebsiteSchema()` — used once, globally, by `Layout.astro` (the `InsuranceAgency` node is identical on every page).
- `buildServiceSchema({ pageURL, name, description, serviceType, breadcrumbName, faqs? })` — `seguro-las-palmas/*` pages (`BreadcrumbList` Inicio > ramo, `WebPage`, `Service`; `FAQPage` only if `faqs` is non-empty). There is no `/seguro-las-palmas/` index page, so it is not in the breadcrumb.
- `buildWebPageSchema({ pageURL, name, description?, breadcrumb?, pageType?, isHome? })` — generic page (`ContactPage` via `pageType`), used by home, `contacto`, `asistencia` and the legal pages.
- `buildBlogIndexSchema(...)`, `buildBlogPostSchema(...)` — `/blog/` and articles. No `author` (articles show none); `dateModified` only if the post has `updateDate`.
- JSON-LD text must contain no price, saving or "best/guaranteed" claims.

`src/components/seo/JsonLd.astro` is the `<script>` wrapper used only by `Layout.astro`.

`src/components/seo/FaqSection.astro` exists (renders an accessible `<details>/<summary>` FAQ block from the same `faqs` array passed to `buildServiceSchema`) but is **currently unused** on any page — it was added and then deliberately removed from the 10 product pages that had it at the client's request. If FAQ content is reintroduced, always pair the visible `<FaqSection>` with the `FAQPage` JSON-LD from the same `faqs` array — never ship `FAQPage` schema without matching visible content (Google penalizes mismatched structured data).

### Semantic HTML

Every page must render exactly **one** `<main>`. Watch for these known trip points:
- `contactForm.astro`'s root wrapper is a `<div>` (not `<main>`) — it's embedded inside pages that already have their own `<main>` from `SegurosPage.astro`/`BlogPage.astro`.
- `header.astro`'s products dropdown (`#productsNav`) is a `<nav aria-label="Productos">`, not `<main>` — it's a navigation flyout, not page content.
- `.overlayProducts` (the dropdown panel) is `position: absolute` and depends on the explicit `left:0; right:0; margin:auto` rule in `src/styles/index.css` to stay centered — don't remove those without checking the visual result, the centering isn't implicit from its ancestors.

### Indexing, robots.txt, sitemap and llms.txt

- `src/config/indexing.ts` is the single list of `noindex` pages: the 4 legal pages and `/datacard/*` (`noindex, follow`, constant `NOINDEX_ROBOTS`). To make another page noindex, pass `robots={NOINDEX_ROBOTS}` to `Layout` **and** add its path to `NOINDEX_PATHS` (that keeps it out of the sitemap).
- `public/.htaccess` handles https + single `www` host + `/index.html` → `/` (see `docs/SEO-REDIRECCIONES.md`). It is copied to `dist/`; don't delete it.
- `robots.txt` is **generated** by `src/pages/robots.txt.ts` (no file in `public/`). AI crawlers are allowed by default; build with `AI_CRAWLERS=block` to block them. `/datacard/` is intentionally **not** disallowed: those pages are `noindex` and Google can only read that if it may crawl them. `/api/` is disallowed.
- The sitemap (`@astrojs/sitemap`, config in `src/config/sitemap.ts`) excludes noindex paths. `lastmod` is only emitted where there is a real editorial date: blog posts (`updateDate` ?? `publishDate`) and `/blog/`; other pages have none on purpose. Posts with a future `publishDate` get no `lastmod`.
- `llms.txt` is **generated** at the end of every build by `src/integrations/llms-txt.ts` (there is no file in `public/`; it does not exist under `npm run dev`). It reads the rendered `dist/` pages: each `seguro-las-palmas/*` page's `Service` JSON-LD (name + description) and each article's `BlogPosting` headline. Contact data and the visible address come from `src/config/site.ts`; noindex pages (legal, datacard) never appear. A new ramo needs its slug added to `GROUPS` in that file, otherwise the build warns and lists it under «Otros seguros». The build also warns about any link that does not resolve or points to a noindex page.

### SEO verification (`npm run seo:check`)

`scripts/seo-check.mjs` checks `dist/` after every build (it runs as `postbuild`; exit code 1 on errors) and regenerates `docs/SEO-VERIFICACION.md`. It reads `src/config/site.ts` and `src/config/indexing.ts` directly (Node `--experimental-strip-types`), so NAP is compared against the original data.
- **Errors (fail the build):** missing/duplicate title, missing/duplicate description, `lang`, canonical not absolute/`www`/self/existing, incomplete Open Graph or Twitter, `og:image` missing or with wrong declared size/type, invalid JSON-LD / unresolved `@id` / empty values / forbidden types (`Offer`, `Review`, `AggregateRating`, prices), `InsuranceAgency` not identical across pages, NAP mismatch (site.ts vs JSON-LD vs footer vs `llms.txt`), ramo without `Service`+`areaServed`, noindex pages in the sitemap or indexable pages missing from it, old URLs in the sitemap, broken internal links or links to `.html`/`.php`/`index.html`, localhost/test hosts, `robots.txt`/`.htaccess` basics, `llms.txt` links.
- **Warnings (content, decided by a person):** title > 60, description outside 150–160 characters, commercial claims in JSON-LD, noindex pages without `<h1>`.
- A new noindex page must be added to `src/config/indexing.ts`; nothing else is needed for a new page.

### Content collections

Blog posts live in `src/content/blog/*.md`. Schema defined in `src/content.config.ts`:

| Field | Notes |
|---|---|
| `title` | May include leading emoji — strip with regex before meta/JSON-LD use |
| `last` | `true` = featured post shown first; `false` = regular post. Exactly one post should have `last: true` at any time |
| `description` | Optional; falls back to a generated string |
| `publishDate` | Coerced to `Date` |
| `link` | CTA link on the post card. Internal route **with trailing slash** that exists in `dist/`, `/contacto/` by default. Never `/contacto.html` or other legacy URLs (they 404 in production) |
| `updateDate` | Optional. Real date of the last editorial change; if absent, no `dateModified` is emitted in JSON-LD |

Post images live at `public/images/blog/{slug}.webp` — **the project standardized on `.webp`** (converted from a mix of `.png`/`.webp` in 2026-08; if you ever add a non-webp image, convert it first, e.g. with `sharp`, which is already available transitively via Astro's own dependency tree, no install needed).

**Important, non-obvious architecture**: the blog listing at `/blog/` does **not** render from the content collection. `src/components/articulos.vue` (`client:only="vue"`) fetches `https://raw.githubusercontent.com/diegokp/asegurate-astroweb/main/public/api/data.json` at runtime — a manually-maintained JSON snapshot, kept in sync by hand, that duplicates a *subset* of the frontmatter (`id`, `title`, `slug`, `image`, `imageAlt`, `excerpt`, `publishDate`, `clasificacion` — no `description`/`link`/`last`). `src/pages/api/post.json.ts` is a local Astro endpoint that reads the *actual* content collection but is currently **not used by anything** — it's dead code, left over from before this fetch-from-GitHub pattern existed. Any change to a blog post's `image`, `title`, `excerpt`, etc. must be mirrored in `public/api/data.json` or it won't show up on `/blog/` (it will still work on the post's own `/blog/{slug}/` page, which does read the real collection). See the `blog-nueva-publicacion` skill for the full new-post workflow.

### Vue components

Interactive components use `client:only="vue"` hydration. Static product data lives in `src/components/data/productos.json`, `preguntas.json`, and `productosList.json`.

### Tailwind

`tailwind.config.mjs` uses ESM imports. The `@tailwindcss/typography` plugin is active; `prose max-w-none` is the class used in blog and insurance page content areas.
