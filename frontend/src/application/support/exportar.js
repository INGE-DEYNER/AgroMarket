/**
 * Descarga una tabla como CSV compatible con Excel.
 *
 * Se genera en el navegador (sin dependencias) porque los datos ya están
 * cargados en memoria: no hace falta ir al servidor ni esperar.
 *
 * Se usa en "Gestión de pedidos" y en cualquier otra tabla de los paneles.
 */

/** Escapa un valor para CSV: comillas dobles, comas y saltos de línea. */
function escapar(valor) {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  // El BOM evita que Excel abra el archivo en UTF-8 con caracteres raros.
  if (/"[\n\r",;]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/**
 * @param {string} nombreArchivo  nombre sin extensión, ej. "pedidos"
 * @param {string[]} columnas     cabeceras, en el mismo orden que los datos
 * @param {Array<Array<any>>} filas
 */
export function descargarCsv(nombreArchivo, columnas, filas) {
  if (!Array.isArray(filas) || filas.length === 0) {
    throw new Error("No hay datos para exportar.");
  }

  const cabecera = columnas.map(escapar).join(",");
  const cuerpo = filas.map((fila) => fila.map(escapar).join(","));
  const csv = [cabecera, ...cuerpo].join("\r\n");

  // BOM UTF-8: Excel necesita para reconocer tildes y ñ.
  const blob = new Blob(["﻿" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${nombreArchivo}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

/** Marca de tiempo para nombrar archivos: 2026-09-28-1432 */
export function marcaTemporal() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
