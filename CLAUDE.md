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

`src/layouts/Layout.astro` accepts `title`, `description`, `canonicalURL?`, `ogImage?`, `ogType?`. It always emits a global `InsuranceAgency` JSON-LD block. A `<slot name="head" />` lets individual pages inject additional JSON-LD:

```astro
<Layout title="..." description="..." canonicalURL={url}>
  <script type="application/ld+json" is:inline slot="head" set:html={JSON.stringify(jsonLd)} />
  ...
</Layout>
```

Blog pages (index and `[...slug]`) already use this pattern. Insurance product pages (`seguro-las-palmas/*`) currently pass no `canonicalURL`, so the canonical defaults to the root domain — they also lack page-specific JSON-LD structured data.

`src/schema/hogar.js` exports a `schemaHogar` string (Service + FAQPage + BreadcrumbList) as a template for the pattern that should be applied to all insurance pages, but it is not yet imported anywhere.

### Content collections

Blog posts live in `src/content/blog/*.md`. Schema defined in `src/content.config.ts`:

| Field | Notes |
|---|---|
| `title` | May include leading emoji — strip with regex before meta/JSON-LD use |
| `last` | `true` = featured post shown first; `false` = regular post |
| `description` | Optional; falls back to a generated string |
| `publishDate` | Coerced to `Date` |
| `link` | External or internal CTA link on the post card |

### Vue components

Interactive components use `client:only="vue"` hydration. Static product data lives in `src/components/data/productos.json`, `preguntas.json`, and `productosList.json`.

### Tailwind

`tailwind.config.mjs` uses ESM imports. The `@tailwindcss/typography` plugin is active; `prose max-w-none` is the class used in blog and insurance page content areas.
