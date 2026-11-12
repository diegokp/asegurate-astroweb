import type { APIRoute } from 'astro';
import { site } from '~/config/site';

/**
 * robots.txt generado en el build.
 *
 * Rastreadores de IA (decisión 6): permitidos por defecto. Para bloquearlos, construir con
 * `AI_CRAWLERS=block npm run build`.
 *
 * `/datacard/` ya NO se bloquea aquí: esas páginas son `noindex, follow` y Google solo puede leer
 * ese `noindex` si puede rastrearlas. Fuera del sitemap y sin enlaces internos, no se descubren solas.
 */
const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
];

export const GET: APIRoute = () => {
  const aiPolicy = (process.env.AI_CRAWLERS ?? 'allow').toLowerCase() === 'block' ? 'Disallow: /' : 'Allow: /';

  const lines = [
    `# ${site.name} — Correduría de Seguros`,
    `# ${site.url}`,
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    '# Crawlers de IA: política controlada por la variable AI_CRAWLERS (allow por defecto).',
    ...AI_BOTS.flatMap((bot) => [`User-agent: ${bot}`, aiPolicy, '']),
    `Sitemap: ${site.url}/sitemap-index.xml`,
    '',
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
