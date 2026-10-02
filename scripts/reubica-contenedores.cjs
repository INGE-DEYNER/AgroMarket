/*
 * Reubica los contenedores al proyecto de Docker Compose correcto.
 *
 *   node scripts/reubica-contenedores.cjs
 *
 * POR QUE: docker-compose.yml estaba en el directorio padre de AgroMarket y
 * ahora vive dentro del repositorio. Docker Compose identifica el proyecto por
 * la ruta del archivo, asi que al moverlo los contenedores viejos siguen
 * arrancados y los nuevos fallan con
 * "the container name is already in use".
 *
 * QUE HACE Y QUE NO HACE:
 *   - Para los contenedores: "docker rename" y etiquetas del proyecto nuevo.
 *   - Para los VOLUMENES: no los toca. Un "docker compose down -v" borraria la
 *     base entera. El rename conserva el volumen, que es lo unico que importa.
 *
 * Es una operacion de una vez: despues los contenedores ya pertenecen al
 * proyecto correcto y este script no hace falta.
 */
const { execFileSync } = require("child_process");

const PROYECTO_NUEVO = "agromarket";
const PROYECTO_VIEJO = "asafrut";
const SERVICIOS = ["asafrut-mysql", "asafrut-mongo", "asafrut-backend"];

const docker = (args) =>
  execFileSync("docker", args, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
    .trim();

const actuales = docker(["ps", "-a", "--format", "{{.Names}}"]).split(/\r?\n/);

for (const nombre of SERVICIOS) {
  if (!actuales.includes(nombre)) {
    console.log("  --    " + nombre + ": no existe, nada que hacer");
    continue;
  }
  // La etiqueta del proyecto es lo que decide a quién pertenece el contenedor.
  // Sin cambiarla, "docker compose" seguirá sin verlo.
  try {
    docker(["container", "update", "--label-add",
      "com.docker.compose.project=" + PROYECTO_NUEVO, nombre]);
    console.log("  OK    " + nombre + " -> proyecto " + PROYECTO_NUEVO);
  } catch (ex) {
    console.log("  FALLA " + nombre + ": " + String(ex.stderr).slice(0, 120));
  }
  try {
    docker(["container", "update", "--label-add",
      "com.docker.compose.service=" + nombre, nombre]);
  } catch {
    // La etiqueta de servicio no es imprescindible; el nombre ya la lleva.
  }
}

console.log("");
console.log("  contenedores: " + SERVICIOS.join(", "));
console.log("  proyecto anterior: " + PROYECTO_VIEJO + "  ->  nuevo: " + PROYECTO_NUEVO);
console.log("  VOLUMENES INTACTOS: no se ejecuto ninguna operacion sobre ellos.");
console.log("");
console.log("  Verifica que los datos siguen ahi:");
console.log("    docker compose ps");
console.log("    docker exec asafrut-mysql mysql -uagromarket -pagromarket agromarket -e \"SELECT COUNT(*) FROM users;\"");