import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const entries = await getCollection('blog');

  const posts = entries
    .map((entry) => ({
      id: entry.id,
      slug: entry.data.slug,
      title: entry.data.title,
      excerpt: entry.data.excerpt ?? '',
      coverImage: entry.data.image,
      publishedAt: entry.data.publishDate,
    }))
    // Ordenamos por fecha descendente (más reciente primero)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
