import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/kupcyclogiego/",   // ← NAZWA TWOJEGO REPO!
  plugins: [react()],
});
