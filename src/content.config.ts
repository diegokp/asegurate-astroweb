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
			publishDate: z.string()
      .or(z.date())
      .transform((val) => new Date(val)),
			link: z.string()
		}),
});

export const collections = { blog };
