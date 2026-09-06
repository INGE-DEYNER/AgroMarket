import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: "/",
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor-react";
            }
            if (id.includes("i18next") || id.includes("react-i18next")) {
              return "vendor-i18n";
            }
            if (id.includes("recharts")) {
              return "vendor-charts";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: true, // escucha en 0.0.0.0 (necesario en Docker/VMs/entornos remotos)
    port: 5173,
    strictPort: true, // si el 5173 está ocupado, FALLA en vez de saltar a otro puerto
    // en silencio (esto es lo que provoca los "net::ERR_CONNECTION_REFUSED" y
    // los fallos de WebSocket HMR: el navegador sigue apuntando al 5173 pero
    // Vite realmente levantó en el 5174).
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
});
