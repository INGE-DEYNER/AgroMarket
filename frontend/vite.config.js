import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// FIX: 2026-09-13 - Cache bust for Cloudflare

export default defineConfig({
  plugins: [react({
    jsxImportSource: 'react',
  })],
  base: "/",
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
    global: 'window',
  },
  optimizeDeps: {
    exclude: ['react', 'react-dom'],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: 'react',
      'react-dom': 'react-dom',
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
});
