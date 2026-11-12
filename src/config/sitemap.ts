import fs from 'node:fs';
import path from 'node:path';
import { isNoindexPath } from './indexing';

/**
 * Sitemap: solo URLs canónicas e indexables, con `lastmod` únicamente cuando hay una fecha editorial real.
 *  - Artículos: `updateDate` del frontmatter y, si no existe, `publishDate`.
 *  - /blog/: la fecha más reciente entre los artículos ya publicados.
 *  - Resto de páginas: sin `lastmod` (no hay fecha editorial fiable; una inventada haría que Google lo ignore).
 *  - Un artículo con fecha futura no declara `lastmod`.
 */

const SITE = 'https://www.aseguratte.es';

function frontmatterValue(text: string, key: string): string | undefined {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const m = block.match(new RegExp(`^${key}:\\s*["']?([^"'\\r\\n]+?)["']?\\s*$`, 'm'));
  return m?.[1];
}

function readBlogDates(): Map<string, Date> {
  const dir = path.resolve('src/content/blog');
  const dates = new Map<string, Date>();
  if (!fs.existsSync(dir)) return dates;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    // El id de la colección es el `slug` del frontmatter si existe; si no, el nombre del archivo.
    const slug = frontmatterValue(text, 'slug') ?? file.replace(/\.md$/, '');
    const raw = frontmatterValue(text, 'updateDate') ?? frontmatterValue(text, 'publishDate');
    const d = raw ? new Date(raw) : undefined;
    if (d && !Number.isNaN(d.getTime())) dates.set(`${SITE}/blog/${slug}/`, d);
  }
  return dates;
}

const blogDates = readBlogDates();
const now = new Date();
const published = [...blogDates.values()].filter((d) => d <= now);
const latestPublished = published.length ? new Date(Math.max(...published.map((d) => d.getTime()))) : undefined;

export const sitemapFilter = (page: string): boolean => !isNoindexPath(new URL(page).pathname);

export const sitemapSerialize = <T extends { url: string; lastmod?: string }>(item: T): T => {
  const d = item.url === `${SITE}/blog/` ? latestPublished : blogDates.get(item.url);
  if (d && d <= now) return { ...item, lastmod: d.toISOString() };
  return item;
};
