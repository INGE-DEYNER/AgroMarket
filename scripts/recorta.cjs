/*
 * Recorta un archivo de texto a un numero de lineas.
 *
 *   node scripts/recorta.cjs <archivo> <lineas>
 *
 * POR QUE HACE FALTA: al escribir un archivo largo con varias ediciones, un
 * "insertar en la linea N" puede dejar basura duplicada DESPUES del cierre
 * de la clase. El archivo compila mal y el error de Java apunta a una linea de
 * codigo que en realidad ya estaba bien, asi que seBUSCA el problema en el
 * sitio equivocado. Recortar al final known deja el archivo coherente.
 *
 * Muestra tambien las ultimas lineas que sobreviven, para comprobar que no se
 * corta nada que deberia quedarse.
 */
const fs = require("fs");

const [archivo, n] = process.argv.slice(2);
const limite = Number(n);

if (!archivo || !limite) {
  console.log("uso: recorta.cjs <archivo> <lineas>");
  process.exit(1);
}
if (!fs.existsSync(archivo)) {
  console.log("no existe: " + archivo);
  process.exit(1);
}

const antes = fs.readFileSync(archivo, "utf8").split(/\r?\n/);
console.log("  antes: " + antes.length + " lineas");

if (antes.length <= limite) {
  console.log("  no hay nada que recortar");
  process.exit(0);
}

const despues = antes.slice(0, limite);
// No dejar lineas en blanco al final.
while (despues.length > 0 && despues[despues.length - 1].trim() === "") {
  despues.pop();
}

fs.writeFileSync(archivo, despues.join("\n") + "\n", "utf8");
console.log("  despues: " + despues.length + " lineas");
console.log("  quitadas: " + (antes.length - despues.length));
console.log("");
console.log("  --- ultimas 6 lineas que quedan ---");
for (const l of despues.slice(-6)) console.log("  | " + l);
console.log("");
console.log("  --- 3 lineas que se fueron ---");
for (const l of antes.slice(limite, limite + 3)) console.log("  > " + l);