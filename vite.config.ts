import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import gallery from "./plugins/gallery.ts";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), gallery("content")],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "index.html"),
        contribute: path.resolve(import.meta.dirname, "contribute.html"),
        privacy: path.resolve(import.meta.dirname, "privacy.html"),
        terms: path.resolve(import.meta.dirname, "terms.html"),
        notFound: path.resolve(import.meta.dirname, "404.html")
      }
    }
  }
});
