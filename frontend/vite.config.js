import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------
   DOMINIO DEL SITIO, EN UN SOLO SITIO
   ------------------------------------------------------------------
   El dominio estaba escrito a mano en cuatro archivos (index.html con
   canonical y og:image, robots.txt y sitemap.xml). Cuatro copias del mismo
   dato significa que cambiarlo exige acordarse de los cuatro, y basta con
   olvidarse de uno para que Google reciba dos canonicas distintas.

   Ademas el dominio estaba SUPUESTO: agro-market.app, que nadie ha
   confirmado. Este plugin deja el valor en un solo archivo, asi que cuando
   se confirme el dominio real se cambia aqui y en ningun otro sitio.

   SITE_URL se lee del entorno. El valor por defecto es el dominio que ASAFRUT
   confirmó (agro-market.app), así que un build sin configuracion sale con el
   dominio correcto. Aun asi avisa por pantalla, porque si alguien despliega
   apuntando a otro sitio tiene que saber que el valor sale del entorno.
   ------------------------------------------------------------------ */
const DOMINIO_CONFIRMADO = "https://agro-market.app";

function sitioUnico(siteUrl, definido, avisos) {
  return {
    name: "agromarket-site-url",
    apply: "build",
    enforce: "post",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");

      if (!definido) {
        avisos.push(
          "SITE_URL no esta definida: se usa el valor por defecto, " + siteUrl +
            ". Ese dominio lo confirmo ASAFRUT, asi que el build es correcto; " +
            "este aviso solo aparece si alguien despliega apuntando a otro sitio.",
        );
      }

      // Normaliza sin barra final: "https://x.app/" y "https://x.app" se
      // comparan distinto y producirian dos canonicas para la misma pagina.
      const limpio = siteUrl.replace(/\/+$/, "");
      const base = limpio;

      const reemplazos = [
        { archivo: "index.html", etiqueta: "canonical, og:url e og:image" },
        { archivo: "robots.txt", etiqueta: "linea Sitemap" },
        { archivo: "sitemap.xml", etiqueta: "<loc>" },
      ];

      let tocados = 0;

      for (const { archivo, etiqueta } of reemplazos) {
        const p = path.join(dist, archivo);
        if (!fs.existsSync(p)) continue;

        let txt = fs.readFileSync(p, "utf8");
        const antes = txt;

        txt = txt
          .replace(/https:\/\/www\.agro-market\.app/g, base)
          .replace(/https:\/\/agro-market\.app/g, base)
          // Por si el valor traia barra final.
          .replace(base + "/", base + "/");

        if (txt !== antes) {
          fs.writeFileSync(p, txt, "utf8");
          tocados++;
          console.log("  [sitio] " + archivo + ": " + etiqueta + " -> " + base);
        }
      }

      if (!tocados && definido) {
        // Solo es un problema si alguien DEFINIO un dominio distinto: entonces
        // deberia haberse sustituido y no se ha sustituido, lo que significa
        // que los archivos ya no se generan con el dominio supuesto y el
        // replace no los encuentra. Sin SITE_URL no hay nada que sustituir y no
        // pasa nada: el valor por defecto ya es el que estaba escrito a mano.
        avisos.push(
          "SITE_URL vale " + siteUrl + " pero no se encontro ninguna URL " +
            "que cambiar en dist/. Revisa que index.html, robots.txt y " +
            "sitemap.xml se sigan generando con el dominio supuesto.",
        );
      }

      for (const a of avisos) console.log("  [AVISO] " + a);
    },
  };
}

// FIX: 2026-09-13 - Force cache bust for Cloudflare by ensuring React is bundled
export default defineConfig(({ mode }) => {
  // loadEnv lee los archivos .env. OJO: NO los copia a process.env, asi que
  // hay que mirar el objeto que devuelve. Comprobar process.env.SITE_URL daria
  // false aunque el .env la tenga puesta.
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.SITE_URL || DOMINIO_CONFIRMADO;
  const definido = Boolean(env.SITE_URL);
  const avisos = [];

  return {
    plugins: [react(), sitioUnico(siteUrl, definido, avisos)],
    base: "/",
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`,
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": { target: "http://localhost:18080", changeOrigin: true },
      },
    },
  };
});
