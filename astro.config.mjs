// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import tailwindcssTypography from "@tailwindcss/typography";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [
      tailwindcss({
        config: {
          plugins: [tailwindcssTypography],
        },
      }),
    ],
  },
  adapter: node({
    mode: "standalone",
  }),
});
