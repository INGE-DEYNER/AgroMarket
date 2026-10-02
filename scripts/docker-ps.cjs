/*
 * Lista los contenedores de Docker. cmd.exe parte el --format por los espacios
 * y las comillas, asi que se pasa como un argumento unico de Node.
 *
 *   node scripts/docker-ps.cjs [extra]
 */
const { execFileSync } = require("child_process");

const extra = process.argv.slice(2);
const args = ["ps", "-a", "--format", "{{.Names}}\t{{.Status}}", ...extra];

try {
  const salida = execFileSync("docker", args, { encoding: "utf8" });
  process.stdout.write(salida);
} catch (ex) {
  console.log("error: " + (ex.stderr || ex.message));
}