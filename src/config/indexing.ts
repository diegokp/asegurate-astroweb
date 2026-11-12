/**
 * Política de indexación (fuente única para páginas, sitemap y robots.txt).
 * Decisión 4 (2026-11-12): las páginas legales y las datacards son `noindex, follow` y quedan fuera del sitemap.
 */

/** Valor de <meta name="robots"> para las páginas que no deben indexarse pero sí seguirse. */
export const NOINDEX_ROBOTS = 'noindex, follow';

/** Rutas noindex. Las que acaban en «/» y son carpetas (datacard) cubren todo lo que cuelga de ellas. */
export const NOINDEX_PATHS = [
  '/aviso-legal/',
  '/politica-privacidad/',
  '/politica-privacidad-redes/',
  '/cookies/',
  '/datacard/',
];

export const isNoindexPath = (pathname: string): boolean =>
  NOINDEX_PATHS.some((p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : p + '/'));
