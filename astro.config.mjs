// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import tailwindcssTypography from "@tailwindcss/typography";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

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
  adapter: cloudflare({
    imageService: "compile",
  }),
  env: {
    schema: {
      SUPABASE_URL: envField.string({
        context: "server",
        access: "secret",
      }),
      SUPABASE_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
});
