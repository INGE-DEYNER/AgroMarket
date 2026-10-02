/*
 * Convierte las imagenes del frontend a WebP y genera los iconos que faltan.
 *
 * Se ejecuta DENTRO del contenedor de este mismo directorio:
 *
 *   docker build -t optimiza-imagenes scripts/imagenes
 *   docker run --rm -v <repo>:/repo optimiza-imagenes /repo
 *
 * POR QUE HACE FALTA: dist/ pesaba 25,6 MB, de los cuales 24 MB eran PNG. La
 * home descargaba unos 12 MB solo en imagenes. Un PNG de fotografia de 2 MB es
 * un JPEG mal guardado: WebP al mismo aspecto visual pesa entre 8 y 12 veces
 * menos, y lo soportan todos los navegadores desde 2020.
 *
 * TAMANOS: ademas de cambiar de formato, se recorta al ancho maximo al que la
 * imagen se ve de verdad. Guardar 2211 px para una insignia de 120 px es
 * gastar 40 veces mas bytes de los que alguien llega a ver.
 *
 * NO se borra ningun original: el PNG queda como fuente.
 */
import sharp from "sharp";
import { readdir, mkdir, stat, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const RAIZ = process.argv[2] || "/repo";
const FRONT = path.join(RAIZ, "frontend");

/**
 * Ancho maximo por carpeta.
 *
 * No son numeros inventados: salen de como se muestran en el CSS.
 *  - assets/home: las categorias se ven en circulos de ~120 px, pero en
 *    pantallas grandes la rejilla crece; 1200 cubre sin pixelizar.
 *  - El hero se ve a pantalla completa; 2000 px cubren pantallas grandes.
 *  - El logo del navbar se ve a 36-40 px: 256 es de sobra.
 */
const REGLAS = {
  "src/assets/home": { ancho: 1200, calidad: 78 },
  "src/assets": { ancho: 1600, calidad: 80 },
  "public/agromarket": { ancho: 256, calidad: 85 },
  "public/stakeholders": { ancho: 400, calidad: 85 },
  "public/by": { ancho: 400, calidad: 82 },
};

const reglaPara = (rel) => REGLAS[rel] || { ancho: 1600, calidad: 80 };

const walk = async (dir, acc = []) => {
  if (!existsSync(dir)) return acc;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) await walk(rel, acc);
    else if (/\.(png|jpe?g)$/i.test(e.name)) acc.push(rel);
  }
  return acc;
};

const kb = (n) => (n / 1024).toFixed(0).padStart(6) + " KB";
const p = console.log;

/* ---------------------------------------------------------------- WEBP */

p("=== Conversión a WebP ===");
p("  " + "origen".padEnd(50) + "   antes    despues    ahorro");

let antesTotal = 0;
let despuesTotal = 0;
let convertidas = 0;

for (const carpeta of Object.keys(REGLAS)) {
  const archivos = await walk(path.join(FRONT, carpeta));

  for (const archivo of archivos) {
    const { ancho, calidad } = reglaPara(carpeta);
    const origen = await stat(archivo);
    const destino = archivo.replace(/\.(png|jpe?g)$/i, ".webp");

    try {
      await sharp(archivo)
        .resize({ width: ancho, withoutEnlargement: true })
        .webp({ quality: calidad, effort: 6 })
        .toFile(destino);

      const salida = await stat(destino);
      antesTotal += origen.size;
      despuesTotal += salida.size;
      convertidas += 1;
      const ahorro = Math.round((1 - salida.size / origen.size) * 100);

      p("  " + path.relative(FRONT, archivo).slice(0, 48).padEnd(50)
        + kb(origen.size) + " " + kb(salida.size) + "    " + ahorro + "%");

/* ------------------------------------------------------------ ICONOS */

p("");
p("=== Iconos que faltaban ===");

const dirIconos = path.join(FRONT, "public", "icons");
await mkdir(dirIconos, { recursive: true });

/*
 * Los iconos se generan desde public/favicon.svg, que ya existe y lleva el
 * diseno de marca. Se renderiza al tamano pedido en vez de buscar un PNG de
 * 512 que nadie dibuja.
 *
 * density: 384 es lo que hace que un SVG vectorial se rasterice con detalle
 * suficiente a 512 px en vez de estirar un dibujo de 100 px.
 */
const svgFavicon = path.join(FRONT, "public", "favicon.svg");
const svgBuffer = await readFile(svgFavicon);

const ICONOS = [
  { archivo: "favicon-32.png", size: 32 },
  { archivo: "favicon-192.png", size: 192 },
  { archivo: "favicon-512.png", size: 512 },
  { archivo: "apple-touch-icon.png", size: 180 },
];

for (const { archivo, size } of ICONOS) {
  const destino = path.join(dirIconos, archivo);
  await sharp(svgBuffer, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(destino);
  p("  OK  " + archivo.padEnd(24) + size + "x" + size + "  "
    + kb((await stat(destino)).size));
}

/*
 * El icono "maskable" es para Android, que recorta un porcentaje por cada lado.
 * El contenido util tiene que caber en el centro: por eso se reduce a 410 px y
 * se rodea de fondo de marca, en vez de estirar el dibujo hasta 512.
 */
const destinoMaskable = path.join(dirIconos, "favicon-maskable-512.png");
await sharp(svgBuffer, { density: 384 })
  .resize(410, 410)
  .extend({
    top: 51, bottom: 51, left: 51, right: 51,
    background: "#1a5c2a",
  })
  .png({ compressionLevel: 9 })
  .toFile(destinoMaskable);
p("  OK  " + "favicon-maskable-512.png".padEnd(24) + "512x512  "
  + kb((await stat(destinoMaskable)).size));

/* ------------------------------------------------------- OG (portada) */

p("");
p("=== Imagen para compartir (Open Graph) ===");

/*
 * La vista previa al compartir en WhatsApp o Facebook pide 1200x630, la medida
 * que usan esas plataformas. Sin ella, el enlace se comparte como un
 * rectangulo vacio, y en Colombia es justo por donde entra la gente.
 *
 * Se compone con la foto del hero recortada a ese formato y el logo encima,
 * en vez de exportar un diseno nuevo: sale igual que la portada.
 */
const hero = path.join(FRONT, "src", "assets", "home", "home-hero.png");
const destinoOg = path.join(FRONT, "public", "og-cover.png");

if (existsSync(hero)) {
  const logo = await sharp(svgBuffer, { density: 384 })
    .resize(220, 220)
    .toBuffer();

  const velo = Buffer.from(
    '<svg width="1200" height="630">'
    + '<rect width="1200" height="630" fill="#0e2a16" fill-opacity="0.42"/>'
    + "</svg>",
  );

  await sharp(hero)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .composite([
      { input: velo, top: 0, left: 0 },
      { input: logo, top: 205, left: 490 },
    ])
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(destinoOg);

  p("  OK  og-cover.png  1200x630  " + kb((await stat(destinoOg)).size));
} else {
  p("  --  no se encontro el hero; no se genero og-cover.png");
}

p("");
p("RESULTADO: WebP generado e iconos creados.");
p("Falta cambiar en el codigo los import de .png a .webp.");
p("Los PNG originales se conservan como fuente.");
    } catch (ex) {
      p("  FALLA " + path.relative(FRONT, archivo) + ": " + ex.message);
    }
  }
}

p("");
p("  " + convertidas + " imagenes convertidas");
p("  " + kb(antesTotal) + "  ->  " + kb(despuesTotal)
  + "   (" + Math.round((1 - despuesTotal / antesTotal) * 100) + "% menos)");