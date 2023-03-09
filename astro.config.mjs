import { defineConfig } from "astro/config";
import unocss from "unocss/astro";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [unocss()],
  output: "server",
  adapter: vercel(),
});
