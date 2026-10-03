/**
 * Historial de navegación del usuario.
 *
 * Es el ÚNICO módulo que no tiene backing en el backend, y es a propósito: la
 * navegación es un dato del navegador (qué vio este usuario, en este
 * dispositivo), no un hecho de negocio que deba persistirse en servidor. Por
 * eso vive en `localStorage` en vez de gastar una tabla y un endpoint.
 *
 * Antes esta pantalla mostraba productos inventados y fijos en el código
 * ("Aguacate Hass $8.500", etc.), es decir, datos falsos. Ahora registra los
 * productos que el usuario visita de verdad.
 */

const CLAVE = "agromarket_historial";
const MAXIMO = 40;
const DIAS_MAXIMOS = 14;

/** Lee el historial y lo agrupa por día (Hoy / Ayer / fecha). */
export function leerHistorial() {
  try {
    const crudo = JSON.parse(localStorage.getItem(CLAVE) || "[]");
    if (!Array.isArray(crudo)) return [];
    return crudo
      .filter((e) => e && e.id && e.nombre)
      .slice(0, MAXIMO);
  } catch {
    return [];
  }
}

/** Registra una visita. Si el producto ya estaba, lo mueve al principio. */
export function registrarVisita(producto) {
  if (!producto?.id) return;
  try {
    const anterior = leerHistorial();
    const ahora = Date.now();
    const resto = anterior.filter((e) => e.id !== producto.id);
    const nuevo = {
      id: producto.id,
      nombre: producto.nombre || producto.name || "Producto",
      precio: Number(producto.precio ?? producto.price ?? 0) || 0,
      unidad: producto.unidad || producto.unit || "",
      vistoEn: ahora,
    };
    localStorage.setItem(
      CLAVE,
      JSON.stringify([nuevo, ...resto].slice(0, MAXIMO)),
    );
  } catch {
    // localStorage puede estar bloqueado (modo privado): el historial es
    // opcional, así que un fallo aqui no debe romper la navegacion.
  }
}

/** Vacía el historial. */
export function limpiarHistorial() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // ignorado por el mismo motivo que arriba
  }
}

/** Agrupa el historial por día para pintarlo por secciones. */
export function agruparPorDia(entradas) {
  const hoy = new Date();
  const inicioHoy = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
  ).getTime();

  const grupos = new Map();
  for (const entrada of entradas) {
    const dia = new Date(entrada.vistoEn);
    const inicioDia = new Date(
      dia.getFullYear(),
      dia.getMonth(),
      dia.getDate(),
    ).getTime();

    if (inicioHoy - inicioDia > DIAS_MAXIMOS * 24 * 60 * 60 * 1000) {
      continue;
    }

    let etiqueta;
    const dias = Math.round((inicioHoy - inicioDia) / 86400000);
    if (dias === 0) {
      etiqueta = "Hoy";
    } else if (dias === 1) {
      etiqueta = "Ayer";
    } else {
      etiqueta = dia.toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
      });
    }

    if (!grupos.has(etiqueta)) grupos.set(etiqueta, []);
    grupos.get(etiqueta).push(entrada);
  }

  return grupos;
}
