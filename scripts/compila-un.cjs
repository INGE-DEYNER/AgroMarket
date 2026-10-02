/*
 * Compila UN archivo java y muestra los errores de verdad.
 *
 *   node scripts/compila-un.cjs <ruta-relativa-al-modulo>
 *
 * POR QUE HACE FALTA: el Dockerfile compila con "mvn clean package -q", y la
 * -q se come justo la linea que dice QUE archivo y QUE linea esta mal. Solo
 * queda un "Compilation failure:" sin contenido, que no sirve para nada.
 *
 * Con javac directo contra el classpath ya descargado en ~/.m2, el error sale
 * completo y con numero de linea. Es mas lento que mvn, pero cuando compila
 * bien no hace falta: solo se usa para diagnosticar.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const MODULO = path.resolve(__dirname, "..", "agroMarket");
const relativo = process.argv[2];

if (!relativo) {
  console.log("uso: compila-un.cjs <ruta-relativa-desde-agroMarket>");
  process.exit(1);
}

const destino = path.join(MODULO, "target", "check-clase");
fs.mkdirSync(destino, { recursive: true });

/*
 * Se recoge el classpath de las dependencias ya resueltas por maven.
 *
 * En Windows "mvn" es un .cmd, no un .exe, y execFileSync lo rechaza: con
 * "mvn" da ENOENT y con "mvn.cmd" da EINVAL, porque los .cmd no se pueden
 * lanzar como proceso nativo. La unica via es pasar por cmd.exe /c, y por eso
 * el comando va montado como UNA cadena.
 */
const MAVEN_ARGS = "-o dependency:build-classpath -Dmdep.outputFile=target/cp.txt -q";

const correrMaven = () => {
  if (process.platform === "win32") {
    return execFileSync("cmd.exe", ["/c", "mvn " + MAVEN_ARGS], {
      cwd: MODULO,
      encoding: "utf8",
      timeout: 10 * 60 * 1000,
      stdio: ["ignore", "pipe", "pipe"],
    });
  }
  return execFileSync("mvn", ["-o", "dependency:build-classpath",
    "-Dmdep.outputFile=target/cp.txt", "-q"], {
    cwd: MODULO,
    encoding: "utf8",
    timeout: 10 * 60 * 1000,
    stdio: ["ignore", "pipe", "pipe"],
  });
};

let classpath;
try {
  classpath = correrMaven();
} catch (ex) {
  console.log("  no se pudo resolver el classpath: "
    + String(ex.stderr || ex.message).slice(0, 300));
  process.exit(2);
}

const archivoCp = path.join(MODULO, "target", "cp.txt");
if (!fs.existsSync(archivoCp)) {
  console.log("  maven no escribio target/cp.txt");
  process.exit(2);
}
classpath = fs.readFileSync(archivoCp, "utf8").trim();

/*
 * Se anade target/classes al classpath.
 *
 * Sin esto, al compilar UN solo archivo, javac no encuentra las clases del
 * PROPIO proyecto (EmailPort, @RequiredArgsConstructor, etc.) y reporta
 * "cannot find symbol" en errores que no existen. Compilaba un archivo
 * perfecto y decia que estaba roto.
 *
 * Es una limitacion de este metodo, no del codigo: el build de maven compila
 * todo junto y si resuelve esas referencias.
 */
const clasesProyecto = path.join(MODULO, "target", "classes");
if (fs.existsSync(clasesProyecto)) {
  classpath = clasesProyecto + path.delimiter + classpath;
} else {
  console.log("  aviso: no hay target/classes; los simbolos del propio proyecto");
  console.log("  no se van a resolver y pueden aparecer errores falsos.");
  console.log("  Ejecuta 'mvn compile' antes de usar este script.");
}

console.log("  compilando " + relativo);
console.log("");

try {
  execFileSync("javac", [
    "-nowarn",
    "-encoding", "UTF-8",
    "-classpath", classpath,
    "-d", destino,
    path.join(MODULO, relativo),
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  console.log("  COMPILA SIN ERRORES");
  process.exit(0);
} catch (ex) {
  const salida = (String(ex.stdout || "") + String(ex.stderr || "")).trim();
  console.log("  ERRORES DE COMPILACION:");
  console.log("");
  for (const l of salida.split(/\r?\n/)) {
    if (l.trim()) console.log("  " + l.slice(0, 220));
  }
  process.exit(1);
}