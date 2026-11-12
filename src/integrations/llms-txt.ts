import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { site } from '../config/site';
import { isNoindexPath } from '../config/indexing';

/**
 * Genera `llms.txt` al final del build a partir del HTML YA renderizado en `dist/`.
 * Así el contenido sale de las mismas páginas que ve el buscador (títulos y JSON-LD), sin duplicar datos
 * a mano, y solo entran páginas que existen y son indexables.
 *
 *  - Servicios: un enlace por ramo (`/seguro-las-palmas/<ramo>/`), con la `description` de su `Service`
 *    (JSON-LD), que no lleva promesas. Agrupados con GROUPS.
 *  - Guías: artículos del blog, del más reciente al más antiguo (solo título: sus descripciones de meta
 *    son textos de captación).
 *  - Contacto y datos clave: salen de `src/config/site.ts` (mismo NAP que el JSON-LD).
 *  - Sin páginas legales ni URLs antiguas.
 */

const GROUPS: { title: string; slugs: string[] }[] = [
  { title: 'Seguros de hogar y familia', slugs: ['hogar', 'decesos', 'salud', 'vida', 'mascotas', 'viajes'] },
  { title: 'Seguros de vehículos', slugs: ['autos', 'motos', 'ciclomotores', 'vehiculos-clasicos', 'embarcaciones'] },
  { title: 'Seguros de ahorro y pensiones', slugs: ['planes-pensiones', 'pias', 'sialp', 'unit-linked'] },
  {
    title: 'Seguros de accidentes y protección personal',
    slugs: ['accidentes-individual', 'accidentes-convenios', 'baja-laboral', 'defensa-juridica', 'responsabilidad-civil'],
  },
  { title: 'Seguros para empresas y autónomos', slugs: ['comercios', 'oficinas', 'pymes', 'flotas', 'defensa-juridica-empresa'] },
];

interface PageInfo {
  url: string;
  graph: any[];
}

const limitWords = (text: string, max = 30): string => {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  if (words.length <= max) return text.replace(/\s+/g, ' ').trim();
  const cut = words.slice(0, max).join(' ');
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('.'));
  return lastStop > cut.length * 0.5 ? cut.slice(0, lastStop + 1) : cut.replace(/[,;:\s]+$/, '') + '…';
};

function readPage(dist: string, pathname: string): PageInfo | undefined {
  const file = path.join(dist, pathname, 'index.html');
  if (!fs.existsSync(file)) return undefined;
  const html = fs.readFileSync(file, 'utf8');
  const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  if (robots.includes('noindex')) return undefined;
  let graph: any[] = [];
  try {
    graph = block ? JSON.parse(block)['@graph'] ?? [] : [];
  } catch {
    graph = [];
  }
  return { url: `${site.url}${pathname}`, graph };
}

export function buildLlmsTxt(dist: string): { text: string; warnings: string[] } {
  const warnings: string[] = [];
  const out: string[] = [];

  out.push(`# ${site.name}`, '');
  out.push(
    `> Correduría de seguros con oficina en Playa de Arinaga (Gran Canaria) que presta servicio en las Islas Canarias y España: seguros para particulares, vehículos, ahorro, protección personal y empresas.`,
    '',
  );

  // --- Servicios ---
  const ramosDir = path.join(dist, 'seguro-las-palmas');
  const allSlugs = fs.existsSync(ramosDir) ? fs.readdirSync(ramosDir).filter((d) => fs.existsSync(path.join(ramosDir, d, 'index.html'))) : [];
  const grouped = new Set(GROUPS.flatMap((g) => g.slugs));
  const extra = allSlugs.filter((s) => !grouped.has(s)).sort();
  if (extra.length) warnings.push(`Ramos sin grupo en llms.txt (se añaden a «Otros seguros»): ${extra.join(', ')}. Añádelos a GROUPS.`);
  const groups = [...GROUPS, ...(extra.length ? [{ title: 'Otros seguros', slugs: extra }] : [])];

  out.push('## Servicios', '');
  for (const g of groups) {
    out.push(`### ${g.title}`);
    for (const slug of g.slugs) {
      const page = readPage(dist, `/seguro-las-palmas/${slug}/`);
      if (!page) {
        warnings.push(`El ramo «${slug}» está en GROUPS pero no existe como página indexable: no se incluye.`);
        continue;
      }
      const service = page.graph.find((n) => n['@type'] === 'Service');
      if (!service?.name) {
        warnings.push(`El ramo «${slug}» no tiene nodo Service en su JSON-LD: no se incluye.`);
        continue;
      }
      out.push(`- [${service.name}](${page.url})${service.description ? `: ${limitWords(service.description)}` : ''}`);
    }
    out.push('');
  }

  // --- Guías (blog) ---
  const blogDir = path.join(dist, 'blog');
  const posts: { headline: string; url: string; date: string }[] = [];
  if (fs.existsSync(blogDir)) {
    for (const d of fs.readdirSync(blogDir)) {
      const page = readPage(dist, `/blog/${d}/`);
      const post = page?.graph.find((n) => n['@type'] === 'BlogPosting');
      if (page && post?.headline) posts.push({ headline: post.headline, url: page.url, date: post.datePublished ?? '' });
    }
  }
  posts.sort((a, b) => b.date.localeCompare(a.date));
  out.push('## Guías', '', ...posts.map((p) => `- [${p.headline}](${p.url})`), '');

  // --- Contacto y datos clave (mismo dato que el JSON-LD) ---
  const contact = readPage(dist, '/contacto/');
  const assist = readPage(dist, '/asistencia/');
  out.push('## Contacto', '');
  if (contact) out.push(`- [Contacto](${contact.url}): formulario, teléfonos, correo y dirección de la oficina.`);
  if (assist) out.push(`- [Asistencia 24hs](${assist.url}): teléfonos de asistencia de las compañías para clientes.`);
  out.push(
    `- Teléfonos: ${site.phones.map((p) => `${p.display} (${p.e164})`).join(' · ')}`,
    `- WhatsApp: ${site.phones.find((p) => p.e164.replace('+', '') === site.whatsapp)?.display ?? site.whatsapp}`,
    `- Correo: ${site.email}`,
    `- Dirección: ${site.addressDisplay}`,
    '',
    '## Datos clave',
    '',
    `- Nombre: ${site.name} (${site.legalName})`,
    '- Actividad: correduría de seguros',
    `- Zona de servicio: ${site.areaServed.map((a) => a.name).join(' y ')}`,
    '- Idioma: español',
    `- Web: ${site.url}/`,
    '',
  );

  const text = out.join('\n');

  // Comprobaciones: todo enlace resuelve a una página existente e indexable.
  for (const m of text.matchAll(/\]\((https:\/\/[^)]+)\)/g)) {
    const u = new URL(m[1]);
    if (u.origin !== site.url) warnings.push(`Enlace fuera del dominio: ${m[1]}`);
    else if (isNoindexPath(u.pathname)) warnings.push(`Enlace a página noindex: ${m[1]}`);
    else if (!fs.existsSync(path.join(dist, u.pathname, 'index.html'))) warnings.push(`Enlace que no resuelve: ${m[1]}`);
  }

  return { text, warnings };
}

export default function llmsTxt(): AstroIntegration {
  return {
    name: 'llms-txt',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const { text, warnings } = buildLlmsTxt(dist);
        fs.writeFileSync(path.join(dist, 'llms.txt'), text, 'utf8');
        logger.info(`llms.txt generado (${text.split('\n').length} líneas)`);
        for (const w of warnings) logger.warn(w);
      },
    },
  };
}
