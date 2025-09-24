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
			publishDate: z.coerce.date().default(new Date(2014, 0, 1)),
			link: z.string(),
			draft: z.boolean()
		}),
});

export const collections = { blog };
