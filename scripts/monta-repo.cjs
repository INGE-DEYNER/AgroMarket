/*
 * Devuelve una ruta del repositorio SIN ESPACIOS, para poder montarla en un
 * contenedor de Docker.
 *
 *   node scripts/monta-repo.cjs
 *
 * POR QUE HACE FALTA: el repositorio esta en "D:\...\Deyner Chaverra\..." y
 * Docker Desktop en Windows no monta de forma fiable un bind mount cuya ruta
 * tenga espacios. Se probaron tres formas y las tres fallaron en silencio:
 *   -v "C:\...\con espacios:/repo"  -> invalid reference format
 *   -v "/C/.../con espacios:/repo"  -> monta, pero /repo queda VACIO
 *
 * Un montaje que no funciona NO da error: el contenedor arranca con el
 * directorio vacio, el script no encuentra ninguna imagen, imprime "0
 * imagenes convertidas" y termina con codigo 0. Por eso el uso de este script
 * es obligatorio antes del optimizador, no una comodidad.
 *
 * SOLUCION: un junction de Windows en una ruta corta. "mklink /J" no pide
 * permisos de administrador y para Docker es indistinguible de una ruta real.
 *
 * NO se intenta la via corta 8.3 (%~sI): suele estar desactivada, y cuando
 * existe devuelve la ruta entrecomillada de forma inconsistente, que es
 * justo el caso que hay que evitar.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/*
 * RAIZ es la raiz del REPOSITORIO, que es un nivel por encima de scripts/.
 *
 * OJO: con "../.." se\subia de mas y se acababa montando el directorio
 * PADRE, que ademas es donde viven los archivos de trabajo. Ahi no esta el
 * frontend, asi que el contenedor no encontraba ninguna imagen.
 */
const RAIZ = path.resolve(__dirname, "..");
const DESTINO = "C:\\agro-market-temp";

/*
 * Comprueba que el junction sirve el repositorio de verdad, mirando su
 * CONTENIDO en vez de comparar rutas resueltas.
 *
 * Comparar realpathSync no sirvio: devuelve rutas con la caja real y con la
 * abreviatura 8.3 distinta en cada lado, de modo que el junction recien
 * creado se rechazaba a si mismo. Preguntar "¿esta el frontend ahi?" no tiene
 * esa ambiguedad y ademas comprueba lo que de verdad importa: que se pueda
 * montar y trabajar sobre el codigo.
 */
const tieneElCodigo = (raiz) => {
  const marcas = [
    "frontend/package.json",
    "frontend/src/index.css",
    path.join("frontend", "src", "assets", "home", "home-hero.png"),
  ];
  return marcas.every((m) => fs.existsSync(path.join(raiz, m)));
};

if (tieneElCodigo(DESTINO)) {
  process.stdout.write(DESTINO.replace(/\\/g, "/"));
  process.exit(0);
}

if (fs.existsSync(DESTINO)) {
  /*
   * Hay algo en DESTINO y no es nuestro junction. No se borra: podria ser un
   * directorio de trabajo de alguien. Se dice que lo revise y se para.
   */
  console.error("YA EXISTE " + DESTINO + " y no apunta a este repositorio.");
  console.error("No se borra. Borralo a mano o cambia DESTINO en este script.");
  process.exit(1);
}

try {
  execFileSync("cmd.exe", ["/c", "mklink", "/J", DESTINO, RAIZ], {
    encoding: "utf8",
    timeout: 30000,
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (ex) {
  console.error("No se pudo crear el junction: "
    + String(ex.stderr || ex.message).slice(0, 200));
  process.exit(1);
}

// Se comprueba que de verdad sirve el codigo: sin esta verificacion, un mklink
// fallido en silencio devolveria una ruta que no monta nada.
if (!tieneElCodigo(DESTINO)) {
  console.error("El junction se creo pero NO sirve el codigo del repositorio.");
  console.error("  destino: " + DESTINO);
  process.exit(1);
}

process.stdout.write(DESTINO.replace(/\\/g, "/"));