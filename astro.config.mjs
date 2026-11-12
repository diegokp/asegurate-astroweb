import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from "@astrojs/tailwind";

import sitemap from "@astrojs/sitemap";

import markdoc from '@astrojs/markdoc';
import { sitemapFilter, sitemapSerialize } from './src/config/sitemap.ts';
import llmsTxt from './src/integrations/llms-txt.ts';

// https://astro.build/config
export default defineConfig({
  site:'https://www.aseguratte.es',
  integrations: [
    vue(),
    tailwind(),
    sitemap({
      filter: sitemapFilter,
      serialize: sitemapSerialize,
    }),
    markdoc(),
    llmsTxt(),
  ],
  // experimental: {
  //   liveContentCollections: true,
  // },
});