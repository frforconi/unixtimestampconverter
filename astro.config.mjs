// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  site: "https://unixtimestampconverterepoch.netlify.app/",
  integrations: [vue()]
});