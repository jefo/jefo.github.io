import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://jefo.github.io",
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return (
          !path.startsWith("/labs") &&
          !path.startsWith("/c/") &&
          !["/catalog", "/catalog/"].includes(path) &&
          !/^\/(recipes|guides|notes)\/[^/]+\/?$/.test(path)
        );
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "css-variables",
      wrap: false,
    },
  },
});
