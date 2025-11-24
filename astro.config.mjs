import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from "@astrojs/tailwind";

import sitemap from "@astrojs/sitemap";

import markdoc from '@astrojs/markdoc';

// https://astro.build/config
export default defineConfig({
  site:'https://www.aseguratte.es',
  integrations: [vue(), tailwind(), sitemap(), markdoc()],
  // experimental: {
  //   liveContentCollections: true,
  // },
});