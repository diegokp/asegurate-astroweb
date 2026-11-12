import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" }),
	schema: z.object({
			title: z.string(),
			slug: z.string(),
			image: z.string(),
			imageAlt: z.string(),
			excerpt: z.string(),
			description: z.string().optional(),
			publishDate: z.coerce.date().default(new Date(2014, 0, 1)),
			// Opcional: fecha real de la última modificación editorial. Si falta, el JSON-LD no declara dateModified.
			updateDate: z.coerce.date().optional(),
			link: z.string(),
			last: z.boolean(),
			clasificacion: z.array(z.string()).optional()
		}),
});

export const collections = { blog };
