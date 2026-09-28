import { createHmac } from "node:crypto";

// Sal que se usa para derivar los identificadores de las rutas sensibles.
// No es un secreto de servidor: viaja dentro del bundle, asi que NO protege
// contra un atacante decidido. Su funcion es que las URLs no revelen nombres
// de funciones internas y que no se puedan adivinar por fuerza bruta sobre
// palabras字典 (usuarios, pagos, auditoria...).
// La seguridad real la aplican hasRole("ADMIN") y @PreAuthorize en el backend.
const SALT = "agromarket::ruta-admin::v1";

const OBJETIVOS = [
  "usuarios",
  "pagos",
  "auditoria",
  "configuracion",
  "finanzas",
  "logistica",
];

for (const nombre of OBJETIVOS) {
  const slug = createHmac("sha256", SALT).update(nombre).digest("hex").slice(0, 16);
  console.log('  "' + slug + '": "' + nombre + '",');
}
