import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // "@" maps to "src" inside the current client folder
      "@": path.resolve(import.meta.dirname, "src"),

      // "@shared" maps UP one level (..) to the root shared folder
      "@shared": path.resolve(import.meta.dirname, "../shared"),

      // "@assets" maps UP one level (..) to the attached_assets folder
      "@assets": path.resolve(import.meta.dirname, "../attached_assets"),
    },
  },
  server: {
    // 1. Listen on all network interfaces (fixes 'localhost' issues)
    host: "0.0.0.0",
    port: 5173,
    // 2. PROXY: This connects your React Client to your Node Server
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000", // Points to your Node.js server
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
