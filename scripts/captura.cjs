/*
 * Lanza un comando y guarda su salida en un archivo.
 *
 *   node scripts/captura.cjs <salida.txt> <comando> [args...]
 *   node scripts/captura.cjs <salida.txt> --sql <contenedor> "<sentencia SQL>"
 *
 * POR QUE EXISTE: en Windows, "Start-Process cmd /c algo > archivo 2>&1" no
 * redirige de forma fiable y el archivo sale vacio. Ejecutar con
 * execFileSync y escribir el resultado a mano si funciona siempre.
 *
 * Se usa sobre todo para "mvn" y "docker compose build", que tardan mas que
 * el limite de 30 segundos de la consola.
 *
 * El modo --sql existe porque escribir el SQL directamente en la linea de
 * comandos rompe el escapado de comillas de cmd: mysql recibe "SHOW" y luego
 * "TABLES;" como argumentos sueltos, imprime su ayuda entera y sale con 1.
 * Aqui el SQL viaja como un argumento de Node, sin que pase por cmd.
 */
const fs = require("fs");
const { execFileSync } = require("child_process");

const [salida, ...resto] = process.argv.slice(2);

if (!salida || resto.length === 0) {
  console.log("uso: captura.cjs <salida.txt> <comando> [args...]");
  console.log("     captura.cjs <salida.txt> --sql <contenedor> \"<SQL>\"");
  process.exit(1);
}

let comando;
let args;

if (resto[0] === "--sql") {
  // --sql <contenedor> <SQL>
  const [contenedor, sql] = resto.slice(1);
  if (!contenedor || !sql) {
    console.log("uso: captura.cjs <salida.txt> --sql <contenedor> <SQL>");
    console.log("     captura.cjs <salida.txt> --sql-file <contenedor> <archivo.sql>");
    process.exit(1);
  }
  comando = "docker";
  // -N -B: sin cabeceras ni separadores, que es lo facil de leer aqui.
  args = ["exec", contenedor, "mysql", "-uagromarket", "-pagromarket",
    "agromarket", "-N", "-B", "-e", sql];
  console.log("SQL: " + sql);
} else if (resto[0] === "--sql-file") {
  /*
   * El SQL va en un archivo, no en la linea de comandos.
   *
   * cmd.exe parte los argumentos que llevan comillas dobles: escribir
   * --sql cont "DESCRIBE revoked_tokens;" hacia que mysql recibiera
   * '"DESCRIBE' con la comilla incluida, y daba error de sintaxis. Ningun
   * escapado desde aqui lo evita, porque el problema ocurre antes de que Node
   * vea el argumento. Leyendolo de un archivo no hay comillas en medio.
   */
  const [contenedor, archivoSql] = resto.slice(1);
  if (!contenedor || !archivoSql || !fs.existsSync(archivoSql)) {
    console.log("uso: captura.cjs <salida.txt> --sql-file <contenedor> <archivo.sql>");
    process.exit(1);
  }
  const sql = fs.readFileSync(archivoSql, "utf8").trim();
  comando = "docker";
  args = ["exec", contenedor, "mysql", "-uagromarket", "-pagromarket",
    "agromarket", "-N", "-B", "-e", sql];
  console.log("SQL (de " + archivoSql + "):");
  console.log(sql);
} else {
  comando = resto[0];
  args = resto.slice(1);
}

console.log("ejecutando: " + [comando, ...args].join(" "));
console.log("saliendo en: " + salida);

let codigo = 0;
let texto = "";
try {
  texto = execFileSync(comando, args, {
    encoding: "utf8",
    timeout: 30 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (ex) {
  codigo = ex.status ?? 1;
  texto = String(ex.stdout || "") + "\n" + String(ex.stderr || "");
}

fs.writeFileSync(salida, texto, "utf8");

// Solo las lineas que deciden si la operacion fue bien.
const decisivas = texto.split(/\r?\n/)
  .filter((l) => /BUILD (SUCCESS|FAILURE)|ERROR|error:|\[ERROR\]/.test(l))
  .slice(0, 25);

console.log("");
for (const l of decisivas) console.log("  " + l);
console.log("");
console.log(codigo === 0 ? "  TERMINO CON CODIGO 0" : "  TERMINO CON CODIGO " + codigo);
process.exit(codigo);