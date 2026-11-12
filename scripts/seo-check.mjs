#!/usr/bin/env node
/**
 * seo:check — verificación SEO sobre `dist/` (ejecutar tras `astro build`).
 *
 *   npm run seo:check                 # errores => código de salida 1; advertencias => 0
 *   npm run seo:check -- --strict     # las advertencias también fallan
 *   npm run seo:check -- --dist ruta  # comprobar otra carpeta (pruebas)
 *   npm run seo:check -- --no-report  # no escribir docs/SEO-VERIFICACION.md
 *
 * ERROR  = fallo técnico (rompe indexación, datos incoherentes, enlaces rotos...). Falla el build.
 * AVISO  = calidad de contenido que decide una persona (longitud de title/description, afirmaciones
 *          comerciales). No falla el build, queda en el informe; con --strict sí.
 *
 * Se ejecuta con `node --experimental-strip-types` para leer `src/config/site.ts` e `indexing.ts`
 * (la misma fuente de datos que usa la web), así que el NAP se compara contra el dato original.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const ROOT = process.cwd();
const DIST = path.resolve(opt('--dist') ?? 'dist');
const STRICT = flag('--strict');
const WRITE_REPORT = !flag('--no-report');

const { site } = await import(pathToFileURL(path.join(ROOT, 'src/config/site.ts')).href);
const { NOINDEX_PATHS, isNoindexPath } = await import(pathToFileURL(path.join(ROOT, 'src/config/indexing.ts')).href);
let sharp = null;
try {
  sharp = (await import('sharp')).default;
} catch {
  /* sin sharp no se pueden medir las imágenes OG: se avisa más abajo */
}

if (!fs.existsSync(DIST)) {
  console.error(`seo:check — no existe ${DIST}. Ejecuta antes "astro build".`);
  process.exit(2);
}

// ───────────────────────── utilidades ─────────────────────────
const SITE = site.url; // https://www.aseguratte.es
const results = []; // { id, level, page, msg }
const stats = {}; // id -> { ok, warn, err }
const CHECKS = {}; // id -> descripción
const bump = (id, k) => ((stats[id] ??= { ok: 0, warn: 0, err: 0 })[k]++);

function check(id, desc, level, page, cond, msg) {
  CHECKS[id] = desc;
  if (cond) return bump(id, 'ok');
  bump(id, level === 'error' ? 'err' : 'warn');
  results.push({ id, level, page, msg });
}

const walk = (d, out = []) => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== '_astro') walk(p, out);
    } else out.push(p);
  }
  return out;
};
const allFiles = walk(DIST);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
const urlOf = (file) => '/' + path.relative(DIST, file).replace(/\\/g, '/').replace(/index\.html$/, '');
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function resolves(urlPath) {
  const clean = decodeURI(urlPath.split('#')[0].split('?')[0]);
  if (!clean) return true;
  const p = path.join(DIST, clean);
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return true;
  return fs.existsSync(path.join(p, 'index.html'));
}

const metaContent = (h, attr, name) => {
  const m = h.match(new RegExp(`<meta[^>]*\\b${attr}="${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'i'));
  const c = m?.[0].match(/\bcontent="([^"]*)"/i);
  return c ? decode(c[1]) : undefined;
};

// ───────────────────────── carga de páginas ─────────────────────────
const pages = htmlFiles.map((file) => {
  const url = urlOf(file);
  const raw = fs.readFileSync(file, 'utf8');
  const html = raw.replace(/<!--[\s\S]*?-->/g, ''); // los comentarios HTML no cuentan
  const robots = metaContent(html, 'name', 'robots') ?? '';
  const noindex = /noindex/i.test(robots);
  const isCard = url.startsWith('/datacard/');
  const is404 = url === '/404.html';
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
  const description = metaContent(html, 'name', 'description');
  const canonical = decode(html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i)?.[1] ?? '') || undefined;
  const h1 = (html.match(/<h1[\s>]/gi) ?? []).length;
  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return { file, url, html, robots, noindex, isCard, is404, title, description, canonical, h1, ldBlocks, ownURL: SITE + url };
});
const indexable = pages.filter((p) => !p.noindex);

// ───────────────────────── 1. Metas ─────────────────────────
for (const p of pages) {
  check('meta.lang', '`<html lang="es">`', 'error', p.url, new RegExp(`<html[^>]*\\blang="${site.lang}"`).test(p.html), `lang distinto de «${site.lang}»`);
  check('meta.title', '`<title>` presente', 'error', p.url, p.title.length > 0, 'sin <title>');
  check('meta.desc', '`meta description` presente', 'error', p.url, !!p.description, 'sin meta description');
  if (p.noindex && p.h1 === 0) {
    check('meta.h1', 'Un solo `<h1>`', p.noindex ? 'warn' : 'error', p.url, false, 'sin <h1> (página noindex)');
  } else {
    check('meta.h1', 'Un solo `<h1>`', 'error', p.url, p.h1 === 1, `${p.h1} <h1> (debe haber 1)`);
  }
}
for (const p of indexable) {
  check('meta.title.len', '`<title>` ≤ 60 caracteres', 'warn', p.url, p.title.length <= 60, `title de ${p.title.length} caracteres`);
  check('meta.desc.len', '`meta description` de 150 a 160 caracteres', 'warn', p.url, !p.description || (p.description.length >= 150 && p.description.length <= 160), `description de ${p.description?.length} caracteres`);
}
const dupe = (key, id, desc, level) => {
  const seen = new Map();
  for (const p of indexable) if (p[key]) (seen.get(p[key]) ?? seen.set(p[key], []).get(p[key])).push(p.url);
  for (const p of indexable) {
    if (!p[key]) continue;
    const same = seen.get(p[key]);
    check(id, desc, level, p.url, same.length === 1, `${key} repetido con ${same.filter((u) => u !== p.url).join(', ')}`);
  }
};
dupe('title', 'meta.title.uniq', '`<title>` único', 'error');
dupe('description', 'meta.desc.uniq', '`meta description` única', 'error');

// ───────────────────────── 2. Canonical ─────────────────────────
for (const p of pages) {
  if (p.isCard) continue;
  if (p.noindex && !p.canonical) {
    bump('canon', 'ok');
    CHECKS.canon = 'Canonical absoluto, con `www`, igual a la propia URL y existente';
    continue;
  }
  const c = p.canonical;
  const d = 'Canonical absoluto, con `www`, igual a la propia URL y existente';
  check('canon', d, 'error', p.url, !!c, 'sin canonical');
  if (!c) continue;
  check('canon', d, 'error', p.url, c.startsWith(SITE + '/'), `canonical sin https://www… : ${c}`);
  check('canon', d, 'error', p.url, c === p.ownURL, `canonical ${c} ≠ URL servida ${p.ownURL}`);
  check('canon', d, 'error', p.url, c.startsWith(SITE) && resolves(new URL(c).pathname), `canonical que no existe en dist: ${c}`);
}

// ───────────────────────── 3. Open Graph y Twitter ─────────────────────────
const mimeOf = { jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' };
let sharpWarned = false;
for (const p of indexable) {
  const og = (n) => metaContent(p.html, 'property', n);
  const tw = (n) => metaContent(p.html, 'name', n);
  const d = 'Open Graph y Twitter completos';
  for (const k of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'og:type', 'og:locale', 'og:site_name'])
    check('og', d, 'error', p.url, !!og(k), `falta ${k}`);
  for (const k of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'])
    check('og', d, 'error', p.url, !!tw(k), `falta ${k}`);
  check('og', d, 'error', p.url, og('og:url') === p.canonical, `og:url (${og('og:url')}) ≠ canonical`);
  check('og', d, 'error', p.url, og('og:locale') === 'es_ES', `og:locale ${og('og:locale')}`);

  const img = og('og:image');
  const d2 = '`og:image` existe y sus dimensiones y tipo declarados son los reales';
  if (!img) continue;
  check('og.img', d2, 'error', p.url, img.startsWith(SITE + '/'), `og:image no es una URL https://www…: ${img}`);
  if (!img.startsWith(SITE + '/')) continue;
  const local = new URL(img).pathname;
  const file = path.join(DIST, local);
  check('og.img', d2, 'error', p.url, fs.existsSync(file), `og:image no existe en dist: ${local}`);
  if (!fs.existsSync(file)) continue;
  if (!sharp) {
    if (!sharpWarned) {
      sharpWarned = true;
      check('og.img', d2, 'warn', '(global)', false, 'sharp no disponible: no se midieron las imágenes OG');
    }
    continue;
  }
  const m = await sharp(file).metadata();
  const decl = { w: og('og:image:width'), h: og('og:image:height'), t: og('og:image:type') };
  const realType = mimeOf[m.format] ?? `image/${m.format}`;
  if (decl.w || decl.h || decl.t) {
    check('og.img', d2, 'error', p.url, decl.w === String(m.width) && decl.h === String(m.height), `og:image declara ${decl.w}×${decl.h} y mide ${m.width}×${m.height}`);
    check('og.img', d2, 'error', p.url, decl.t === realType, `og:image:type ${decl.t} y el archivo es ${realType}`);
  }
}

// ───────────────────────── 4. JSON-LD ─────────────────────────
const FORBIDDEN_TYPES = new Set(['AggregateRating', 'Review', 'Offer', 'AggregateOffer', 'Rating']);
const FORBIDDEN_KEYS = new Set(['price', 'priceCurrency', 'ratingValue', 'reviewCount', 'aggregateRating', 'review']);
const CLAIMS = /mejor(es)? precios?|los mejores (hospitales|precios|seguros|compañías|especialistas)|las mejores (compañías|garantías|tarifas|coberturas)|ahorr(arte|ar te|ar dinero|arás|as dinero)|garantizad[ao]s?|sin espera|rentabilidad (garantizada|superior)|tarifas competitivas|más barato/i;
let agencyRef = null;
let agencyRefPage = null;
for (const p of pages) {
  const d = 'JSON-LD válido, un solo bloque, `@id` resueltos, sin vacíos ni tipos prohibidos';
  if (p.is404 || p.isCard) {
    check('ld', d, 'error', p.url, p.ldBlocks.length === 0, 'esta página no debe llevar JSON-LD');
    continue;
  }
  check('ld', d, 'error', p.url, p.ldBlocks.length === 1, `${p.ldBlocks.length} bloques JSON-LD (debe haber 1)`);
  if (p.ldBlocks.length !== 1) continue;
  let j;
  try {
    j = JSON.parse(p.ldBlocks[0]);
  } catch (e) {
    check('ld', d, 'error', p.url, false, `JSON-LD no es JSON válido: ${e.message}`);
    continue;
  }
  check('ld', d, 'error', p.url, j['@context'] === 'https://schema.org', '@context distinto de https://schema.org');
  const g = j['@graph'];
  check('ld', d, 'error', p.url, Array.isArray(g) && g.length > 0, 'sin @graph');
  if (!Array.isArray(g)) continue;
  const ids = g.map((n) => n['@id']).filter(Boolean);
  check('ld', d, 'error', p.url, new Set(ids).size === ids.length, '@id duplicados en el grafo');
  check('ld', d, 'error', p.url, g.every((n) => n['@type']), 'nodo sin @type');

  const visit = (o, pth = '') => {
    if (Array.isArray(o)) return o.forEach((x, i) => visit(x, `${pth}[${i}]`));
    if (!o || typeof o !== 'object') return;
    const keys = Object.keys(o);
    if (keys.length === 1 && keys[0] === '@id') check('ld', d, 'error', p.url, ids.includes(o['@id']), `@id sin resolver en la página: ${o['@id']}`);
    for (const [k, v] of Object.entries(o)) {
      check('ld', d, 'error', p.url, !(v === '' || v === null || (Array.isArray(v) && v.length === 0)), `valor vacío en ${pth}.${k}`);
      check('ld', d, 'error', p.url, !FORBIDDEN_KEYS.has(k), `propiedad prohibida «${k}» (precios/valoraciones)`);
      if (k === '@type') for (const t of [].concat(v)) check('ld', d, 'error', p.url, !FORBIDDEN_TYPES.has(t), `tipo prohibido «${t}»`);
      if (['url', 'item', '@id', 'logo', 'image', 'sameAs'].includes(k)) {
        for (const x of [].concat(v)) {
          if (typeof x !== 'string' || !/^https?:/.test(x)) continue;
          check('ld', d, 'error', p.url, x.startsWith(SITE + '/') || x === SITE || !x.includes('aseguratte.es'), `URL con host distinto de ${SITE}: ${x}`);
          check('ld', d, 'error', p.url, x.startsWith('https://'), `URL no https: ${x}`);
        }
      }
      if (typeof v === 'string' && !['url', 'item', '@id', '@type'].includes(k))
        check('ld.claims', 'JSON-LD sin promesas de precio, ahorro o «lo mejor»', 'warn', p.url, !CLAIMS.test(v), `afirmación comercial en JSON-LD (${k}): «${v.slice(0, 90)}»`);
      visit(v, `${pth}.${k}`);
    }
  };
  visit(g);

  const agency = g.find((n) => n['@type'] === site.type);
  check('ld.agency', '`InsuranceAgency` presente e idéntica en todas las páginas', 'error', p.url, !!agency, 'sin InsuranceAgency');
  if (agency) {
    const s = JSON.stringify(agency);
    if (agencyRef === null) {
      agencyRef = s;
      agencyRefPage = p.url;
      bump('ld.agency', 'ok');
    } else check('ld.agency', '`InsuranceAgency` presente e idéntica en todas las páginas', 'error', p.url, s === agencyRef, `InsuranceAgency distinta de la de ${agencyRefPage}`);

    // NAP del JSON-LD contra el dato original (site.ts)
    const dn = 'NAP idéntico entre site.ts, JSON-LD, pie, contacto y llms.txt';
    check('nap', dn, 'error', p.url, agency.telephone === site.phones[0].e164, `JSON-LD telephone ${agency.telephone} ≠ site.ts ${site.phones[0].e164}`);
    check('nap', dn, 'error', p.url, agency.email === site.email, `JSON-LD email ${agency.email} ≠ site.ts ${site.email}`);
    check('nap', dn, 'error', p.url, agency.name === site.name, `JSON-LD name «${agency.name}» ≠ «${site.name}»`);
    const a = agency.address ?? {};
    for (const k of ['streetAddress', 'postalCode', 'addressLocality', 'addressRegion', 'addressCountry'])
      check('nap', dn, 'error', p.url, a[k] === site.address[k], `JSON-LD address.${k} «${a[k]}» ≠ «${site.address[k]}»`);
    const cp = (agency.contactPoint ?? []).map((c) => c.telephone).sort().join(',');
    check('nap', dn, 'error', p.url, cp === site.phones.map((x) => x.e164).sort().join(','), `JSON-LD contactPoint (${cp}) ≠ teléfonos de site.ts`);
  }

  // Cada ramo tiene Service con areaServed y provider
  if (p.url.startsWith('/seguro-las-palmas/')) {
    const sv = g.find((n) => n['@type'] === 'Service');
    check('ld.service', 'Cada ramo tiene `Service` con `areaServed` y `provider`', 'error', p.url, !!sv?.areaServed?.length && !!sv?.provider && !!sv?.serviceType, 'Service ausente o sin areaServed/provider/serviceType');
  }
  // BreadcrumbList en todas menos la home
  const hasBc = g.some((n) => n['@type'] === 'BreadcrumbList');
  check('ld.bc', '`BreadcrumbList` en todas las páginas menos la home', 'error', p.url, p.url === '/' ? !hasBc : hasBc, p.url === '/' ? 'la home no debe llevar BreadcrumbList' : 'sin BreadcrumbList');
}

// ───────────────────────── 5. NAP en pie / contacto / llms.txt ─────────────────────────
const dn = 'NAP idéntico entre site.ts, JSON-LD, pie, contacto y llms.txt';
for (const p of pages) {
  if (p.isCard) continue;
  check('nap', dn, 'error', p.url, p.html.includes(site.addressDisplay), 'el pie no contiene la dirección exacta de site.ts');
  for (const ph of site.phones) {
    check('nap', dn, 'error', p.url, p.html.includes(`href="tel:${ph.e164}"`), `falta el enlace tel:${ph.e164}`);
    check('nap', dn, 'error', p.url, p.html.includes(ph.display), `falta el teléfono ${ph.display} con el formato de site.ts`);
  }
  check('nap', dn, 'error', p.url, p.html.includes(`href="mailto:${site.email}"`), `falta mailto:${site.email}`);
}
const llmsPath = path.join(DIST, 'llms.txt');
const llms = fs.existsSync(llmsPath) ? fs.readFileSync(llmsPath, 'utf8') : '';
check('llms', '`llms.txt` existe y sus enlaces resuelven a páginas indexables', 'error', '/llms.txt', llms.length > 0, 'no existe dist/llms.txt');
if (llms) {
  check('nap', dn, 'error', '/llms.txt', llms.includes(site.addressDisplay), 'llms.txt: dirección distinta de site.ts');
  check('nap', dn, 'error', '/llms.txt', llms.includes(site.email), 'llms.txt: falta el correo de site.ts');
  for (const ph of site.phones) check('nap', dn, 'error', '/llms.txt', llms.includes(ph.display), `llms.txt: falta ${ph.display}`);
  check('llms', '`llms.txt` existe y sus enlaces resuelven a páginas indexables', 'error', '/llms.txt', llms.startsWith(`# ${site.name}`), 'la primera línea debe ser «# Nombre»');
  check('llms', '`llms.txt` existe y sus enlaces resuelven a páginas indexables', 'error', '/llms.txt', /^> .{20,200}$/m.test(llms), 'falta la cita descriptiva (20–200 caracteres)');
  const byUrl = new Map(pages.map((p) => [p.ownURL, p]));
  for (const m of llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) {
    const u = m[1];
    const pg = byUrl.get(u);
    check('llms', '`llms.txt` existe y sus enlaces resuelven a páginas indexables', 'error', '/llms.txt', u.startsWith(SITE + '/') && !!pg, `enlace que no resuelve: ${u}`);
    if (pg) check('llms', '`llms.txt` existe y sus enlaces resuelven a páginas indexables', 'error', '/llms.txt', !pg.noindex, `enlace a página noindex: ${u}`);
  }
  // Todos los ramos y artículos indexables aparecen
  for (const p of indexable.filter((x) => x.url.startsWith('/seguro-las-palmas/') || /^\/blog\/.+/.test(x.url)))
    check('llms.cover', 'Todos los ramos y artículos indexables están en `llms.txt`', 'error', p.url, llms.includes(`](${p.ownURL})`), 'no aparece en llms.txt');
}

// ───────────────────────── 6. Indexación: sitemap, robots, noindex ─────────────────────────
const readText = (rel) => (fs.existsSync(path.join(DIST, rel)) ? fs.readFileSync(path.join(DIST, rel), 'utf8') : '');
const sitemapIndex = readText('sitemap-index.xml');
const sitemapFiles = [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
check('sitemap', 'Sitemap coherente con las páginas indexables', 'error', '/sitemap-index.xml', sitemapFiles.length > 0, 'sitemap-index.xml no existe o no lista sitemaps');
const sitemapUrls = [];
const sitemapMeta = new Map();
for (const f of sitemapFiles) {
  check('sitemap', 'Sitemap coherente con las páginas indexables', 'error', '/sitemap-index.xml', f.startsWith(SITE + '/'), `sitemap con host incorrecto: ${f}`);
  const xml = readText(new URL(f).pathname.replace(/^\//, ''));
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    sitemapUrls.push(loc);
    sitemapMeta.set(loc, m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]);
  }
}
const byUrl = new Map(pages.map((p) => [p.ownURL, p]));
const OLD = /\.(html|php)$|\/index\.html$|\/blog2\/|sitemap-xml|\/datacard\//;
for (const u of sitemapUrls) {
  const d = 'Sitemap coherente con las páginas indexables';
  const pg = byUrl.get(u);
  check('sitemap', d, 'error', u, u.startsWith(SITE + '/'), 'URL con host distinto de www');
  check('sitemap', d, 'error', u, !!pg, 'URL del sitemap que no existe en dist');
  check('sitemap', d, 'error', u, !OLD.test(u), 'URL antigua o interna en el sitemap');
  if (pg) {
    check('sitemap', d, 'error', u, !pg.noindex, 'URL noindex en el sitemap');
    check('sitemap', d, 'error', u, pg.canonical === u, `canonical (${pg.canonical}) ≠ URL del sitemap`);
  }
  const lm = sitemapMeta.get(u);
  if (lm) check('sitemap', d, 'error', u, !Number.isNaN(Date.parse(lm)) && Date.parse(lm) <= Date.now(), `lastmod inválido o futuro: ${lm}`);
}
const inSitemap = new Set(sitemapUrls);
for (const p of indexable) check('sitemap', 'Sitemap coherente con las páginas indexables', 'error', p.url, inSitemap.has(p.ownURL), 'página indexable que falta en el sitemap');
// noindex donde toca (y solo donde toca)
for (const p of pages) {
  const expected = isNoindexPath(p.url) || p.is404;
  check('noindex', '`noindex` exactamente donde corresponde (legales, datacards, 404)', 'error', p.url, p.noindex === expected, expected ? 'debería ser noindex' : 'es noindex y no debería');
}
check('noindex', '`noindex` exactamente donde corresponde (legales, datacards, 404)', 'error', '(config)', NOINDEX_PATHS.length > 0, 'NOINDEX_PATHS vacío');

const robotsTxt = readText('robots.txt');
const dr = '`robots.txt` correcto';
check('robots', dr, 'error', '/robots.txt', robotsTxt.length > 0, 'no existe robots.txt');
check('robots', dr, 'error', '/robots.txt', /^User-agent:\s*\*\s*\nAllow:\s*\//m.test(robotsTxt), 'falta «User-agent: * / Allow: /»');
check('robots', dr, 'error', '/robots.txt', robotsTxt.includes(`Sitemap: ${SITE}/sitemap-index.xml`), 'no referencia el sitemap con URL absoluta y www');
check('robots', dr, 'error', '/robots.txt', !/^Disallow:\s*\/(_astro|images|fonts)?\s*$/m.test(robotsTxt.replace(/User-agent: (?!\*)[\s\S]*?(\n\n|$)/g, '')), 'bloquea todo el sitio, CSS, JS o imágenes');
check('robots', dr, 'error', '/robots.txt', !/Disallow:\s*\/datacard/.test(robotsTxt), '/datacard/ bloqueado: Google no podría leer su noindex');

// ───────────────────────── 7. Redirecciones (.htaccess) ─────────────────────────
const ht = readText('.htaccess');
const dh = '`.htaccess` con HTTPS, host único y `/index.html` → `/`';
check('htaccess', dh, 'error', '/.htaccess', ht.length > 0, 'dist/.htaccess no existe (¿falta public/.htaccess?)');
check('htaccess', dh, 'error', '/.htaccess', /%\{HTTPS\}\s+!=on/.test(ht), 'sin redirección a HTTPS');
check('htaccess', dh, 'error', '/.htaccess', /https:\/\/www\.aseguratte\.es%\{REQUEST_URI\}/.test(ht), 'sin redirección a https://www');
check('htaccess', dh, 'error', '/.htaccess', /index\\\.html/.test(ht), 'sin regla /index.html → /');
check('htaccess', dh, 'error', '/.htaccess', /ErrorDocument 404 \/404\.html/.test(ht), 'sin ErrorDocument 404');

// ───────────────────────── 8. Enlaces internos y entornos ─────────────────────────
const dl = 'Enlaces internos que resuelven, sin `.html`/`.php`/`index.html` ni localhost';
const BAD_TARGET = /(\.html|\.php)(\?|#|$)|\/index\.html/;
const TEST_HOSTS = /localhost|127\.0\.0\.1|0\.0\.0\.0|\.netlify\.app|\.vercel\.app|\.pages\.dev|staging\./i;
for (const p of pages) {
  const seen = new Set();
  for (const m of p.html.matchAll(/<(?:a|img|link|script|source)\b[^>]*?\b(?:href|src)="([^"]+)"/gi)) {
    let href = decode(m[1]);
    if (href.startsWith('//') || href.startsWith('#') || /^(mailto|tel|javascript|data):/i.test(href)) continue;
    if (href.startsWith(SITE + '/')) href = href.slice(SITE.length);
    if (!href.startsWith('/')) continue; // externos
    if (seen.has(href)) continue;
    seen.add(href);
    check('links', dl, 'error', p.url, resolves(href), `enlace roto: ${href}`);
    if (href !== '/404.html') check('links', dl, 'error', p.url, !BAD_TARGET.test(href), `enlace a URL antigua/duplicada: ${href}`);
  }
  check('links', dl, 'error', p.url, !TEST_HOSTS.test(p.html.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '')), 'referencia a localhost o a un dominio de pruebas');
}
for (const f of ['llms.txt', 'robots.txt', 'sitemap-0.xml']) {
  check('links', dl, 'error', `/${f}`, !TEST_HOSTS.test(readText(f)), 'referencia a localhost o a un dominio de pruebas');
}

// ───────────────────────── resultados ─────────────────────────
const errors = results.filter((r) => r.level === 'error');
const warns = results.filter((r) => r.level === 'warn');
const total = Object.values(stats).reduce((a, s) => ({ ok: a.ok + s.ok, warn: a.warn + s.warn, err: a.err + s.err }), { ok: 0, warn: 0, err: 0 });

const group = (list) => {
  const m = new Map();
  for (const r of list) (m.get(r.id) ?? m.set(r.id, []).get(r.id)).push(r);
  return m;
};
const lines = [];
lines.push('# Verificación SEO (`npm run seo:check`)', '');
lines.push(`Generado el ${new Date().toISOString().slice(0, 10)} sobre \`${path.relative(ROOT, DIST) || '.'}\` (${pages.length} páginas HTML, ${indexable.length} indexables, ${sitemapUrls.length} URLs en el sitemap).`, '');
lines.push(`**Resultado: ${errors.length ? '❌ FALLA' : '✅ PASA'}** · ✅ ${total.ok} comprobaciones correctas · ⚠️ ${total.warn} avisos · ❌ ${total.err} errores`, '');
lines.push('Un **error** es un fallo técnico y hace fallar el build. Un **aviso** es calidad de contenido que decide una persona (longitud de title/description, afirmaciones comerciales) y no lo hace fallar salvo con `--strict`.', '');
lines.push('## Matriz', '', '| Comprobación | ✅ | ⚠️ | ❌ |', '|---|---:|---:|---:|');
for (const id of Object.keys(stats).sort()) lines.push(`| ${CHECKS[id]} (\`${id}\`) | ${stats[id].ok} | ${stats[id].warn || ''} | ${stats[id].err || ''} |`);
lines.push('');
const section = (title, list) => {
  if (!list.length) return;
  lines.push(`## ${title}`, '');
  for (const [id, items] of group(list)) {
    lines.push(`### \`${id}\` — ${CHECKS[id]} (${items.length})`, '');
    for (const r of items.slice(0, 40)) lines.push(`- \`${r.page}\` — ${r.msg}`);
    if (items.length > 40) lines.push(`- … y ${items.length - 40} más`);
    lines.push('');
  }
};
section('Errores', errors);
section('Avisos', warns);
if (!errors.length && !warns.length) lines.push('Sin errores ni avisos.', '');
const report = lines.join('\n');

if (WRITE_REPORT) {
  fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs/SEO-VERIFICACION.md'), report, 'utf8');
}

// Salida por consola (resumida)
console.log(`\nseo:check — ${pages.length} páginas · ✅ ${total.ok} · ⚠️  ${total.warn} avisos · ❌ ${total.err} errores`);
for (const [id, items] of group(errors)) {
  console.log(`\n❌ ${id} — ${CHECKS[id]} (${items.length})`);
  for (const r of items.slice(0, 8)) console.log(`   ${r.page}  ${r.msg}`);
  if (items.length > 8) console.log(`   … y ${items.length - 8} más (ver docs/SEO-VERIFICACION.md)`);
}
for (const [id, items] of group(warns)) console.log(`⚠️  ${id} — ${CHECKS[id]}: ${items.length}`);
if (WRITE_REPORT) console.log('\nInforme: docs/SEO-VERIFICACION.md');

const fail = errors.length > 0 || (STRICT && warns.length > 0);
console.log(fail ? '\nseo:check FALLA' : '\nseo:check OK');
process.exit(fail ? 1 : 0);
