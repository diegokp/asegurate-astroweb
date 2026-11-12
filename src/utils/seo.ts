import { site } from '~/config/site';

/** Recorta a `max` caracteres sin cortar palabras y añade «…» solo si recorta. */
export function truncateWords(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/, '') + '…';
}

export interface OgImage {
  url: string;
  width?: number;
  height?: number;
  type: string;
}

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

/**
 * Metadatos reales de una imagen de /public (dimensiones y tipo según el contenido del archivo,
 * no según la extensión). Si no se pueden leer, se omiten las dimensiones: es mejor no declararlas
 * que declarar unas falsas.
 */
export async function ogImageFromPublic(publicPath: string): Promise<OgImage> {
  const url = publicPath.startsWith('http') ? publicPath : new URL(publicPath, site.url + '/').toString();
  const ext = publicPath.split('.').pop()?.toLowerCase() ?? '';
  const fallback: OgImage = { url, type: MIME[ext] ?? 'image/png' };
  if (publicPath.startsWith('http')) return fallback;
  try {
    const { default: sharp } = await import('sharp');
    const { width, height, format } = await sharp(`public${publicPath}`).metadata();
    return {
      url,
      width,
      height,
      type: format ? (MIME[format] ?? `image/${format}`) : fallback.type,
    };
  } catch {
    return fallback;
  }
}

/** Quita emojis, espacios y símbolos del principio del título (conserva ¿ ¡ y comillas). */
export function stripLeadingEmoji(title: string): string {
  return title.replace(/^[^\p{L}\p{N}¿¡"“]+/u, '').trim();
}
