import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/chatbot-frontend/",
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    strictPort: true,
    allowedHosts: true
  }
});
