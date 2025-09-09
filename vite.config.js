import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/kupcyclogiego/",    // nazwa repo na GitHub Pages
  plugins: [react()],
});