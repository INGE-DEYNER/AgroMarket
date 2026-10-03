/**
 * Cotizador de envío por distancia.
 *
 * El backend YA calculaba el costo por distancia real (Haversine) en
 * `OrderUseCase.calcularCostoEnvio` y publica las mismas reglas en
 * `GET /api/v1/shipments/config`. El frontend, en cambio, tenía
 * `const [costoEnvio] = useState(0)` en el carrito y en el checkout: un
 * estado inmutable que nunca se recalcula, así que el envío siempre
 * mostraba $0 aunque el backend cobrara otra cosa al confirmar el pedido.
 *
 * Este módulo replica la fórmula del backend para poder mostrar el valor
 * ANTES de confirmar, y toma los parámetros de la API en vez de fijarlos
 * aquí. Si el backend cambia una tarifa, el checkout se entera solo.
 *
 * Fórmula (idéntica a la del backend):
 *   banda = local / regional / nacional según la distancia
 *   costo = max(pesoFacturable × basePorKg, mínimoDeLaBanda)
 */

import api from "@/infrastructure/http/api";
import { departamentoPorNombre, municipioEnCache } from "./geoCatalog.js";

/**
 * Coordenadas de ciudades fuera de Colombia.
 *
 * El catálogo del DANE solo cubre Colombia. Estas son las capitales y grandes
 * ciudades de los demás países que la plataforma soporta; el usuario las elige
 * a mano, así que un catálogo mundial completo no aporta nada.
 */
const EXTRAS_CON_COORDENADAS = {
  "san jose cr": { lat: 9.9281, lon: -84.0907 },
  panama: { lat: 8.9824, lon: -79.5199 },
  miami: { lat: 25.7617, lon: -80.1918 },
  "mexico df": { lat: 19.4326, lon: -99.1332 },
  madrid: { lat: 40.4168, lon: -3.7038 },
};

/**
 * Bandas de trayecto. Deben coincidir con `ShippingTariffs` del backend
 * (domain/services/shipping), que es quien cobra de verdad: si divergen, el
 * checkout muestra una cifra y el pedido cobra otra.
 *
 * Valores validados por Deyner:
 *   Local     $800/kg  · mínimo $3.500   (misma ciudad)
 *   Regional  $1.400/kg · mínimo $6.000   (mismo departamento)
 *   Nacional  $2.200/kg · mínimo $9.500   (entre departamentos)
 *   Especial  $3.200/kg · mínimo $14.000  (zona de difícil acceso)
 */
export const BANDAS_ENVIO = {
  LOCAL: { etiqueta: "Local", porKg: 800, minimo: 3500 },
  REGIONAL: { etiqueta: "Regional", porKg: 1400, minimo: 6000 },
  NACIONAL: { etiqueta: "Nacional", porKg: 2200, minimo: 9500 },
  ESPECIAL: { etiqueta: "Especial", porKg: 3200, minimo: 14000 },
};

/** Radios que separan las bandas, en km. Mismos valores que application.yml. */
export const RADIOS_ENVIO = {
  localKm: 25,
  regionalKm: 180,
};

/** Origen: Centro de acopio ASAFRUT, Chigorodó (Urabá, Antioquia). */
export const ORIGEN_POR_DEFECTO = {
  latitude: 7.6667,
  longitude: -76.6811,
};

/**
 * Parámetros por defecto; se sustituyen por los que publica la API.
 * El backend expone precioPorKilometro y minimumCost como overrides: si vienen
 * vacíos, mandan las bandas de arriba.
 */
export const TARIFAS_POR_DEFECTO = {
  precioPorKilometro: null,
  costoMinimo: null,
};

/**
 * ZONAS LOGÍSTICAS: días de entrega y nombre de la zona.
 *
 * ANTES este bloque traía también las coordenadas, y eran la única fuente de
 * cobertura del cotizador: 26 ciudades. Eso hacía que cualquier municipio
 * fuera de la lista devolviera `conocido: false` y el checkout bloqueara el
 * pedido con "no tenemos cobertura". Un municipio como Marinilla o Girardota
 * no estaba, y sí se entregaba.
 *
 * Ahora las coordenadas salen del catálogo del DANE (1.122 municipios) y aquí
 * solo queda lo que NO es un hecho geográfico: cuántos días tarda el despacho
 * y cómo se llama la zona. Eso lo define AgroMarket, no se deduce de una
 * latitud, así que no se invierte.
 *
 * Si un municipio tiene coordenadas pero no está en esta tabla, el cotizador
 * devuelve `dias: null` y la interfaz dice "plazo a confirmar" en vez de
 * inventar un número.
 */
export const ZONAS_LOGISTICAS = {
  // --- Urabá y environs (zona 1: entrega en 1 día) ---
  chigorodo: { dias: 1, zona: "Urabá" },
  apartado: { dias: 1, zona: "Urabá" },
  turbo: { dias: 1, zona: "Urabá" },
  carepa: { dias: 1, zona: "Urabá" },
  // --- Antioquia y Costa Caribe (zona 2: 2 días) ---
  medellin: { dias: 2, zona: "Antioquia" },
  bello: { dias: 2, zona: "Antioquia" },
  itagui: { dias: 2, zona: "Antioquia" },
  envigado: { dias: 2, zona: "Antioquia" },
  barranquilla: { dias: 2, zona: "Costa Caribe" },
  cartagena: { dias: 2, zona: "Costa Caribe" },
  "santa marta": { dias: 2, zona: "Costa Caribe" },
  // --- Otras regiones (zona 3-5: 3 a 5 días) ---
  bogota: { dias: 3, zona: "Bogotá y Sabana" },
  cali: { dias: 3, zona: "Valle del Cauca" },
  manizales: { dias: 3, zona: "Caldas" },
  pereira: { dias: 3, zona: "Eje Cafetero" },
  armenia: { dias: 3, zona: "Eje Cafetero" },
  bucaramanga: { dias: 4, zona: "Santander" },
  cucuta: { dias: 4, zona: "Norte de Santander" },
  villavicencio: { dias: 4, zona: "Llanos" },
  barranquiria: { dias: 4, zona: "Boyacá" },
  monteria: { dias: 4, zona: "Córdoba" },
  ibague: { dias: 4, zona: "Tolima" },
  pasto: { dias: 5, zona: "Nariño" },
  florencia: { dias: 5, zona: "Caquetá" },
  // --- Fuera del país (zona 6: 8-9 días) ---
  "san jose cr": { dias: 8, zona: "Centroamérica" },
  panama: { dias: 8, zona: "Centroamérica" },
  miami: { dias: 8, zona: "Norteamérica" },
  "mexico df": { dias: 9, zona: "Norteamérica" },
  madrid: { dias: 9, zona: "Europa" },
};

/** Normaliza un nombre para poder buscarlo en la tabla. */
export function normalizarCiudad(ciudad) {
  return String(ciudad || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Coordenadas y datoslogísticos de una ciudad.
 *
 * Busca primero en el catálogo del DANE (que cubre todo el país) y, si no
 * encuentra el municipio, en las ciudades delextranjero que sí tienen
 * coordenadas propias.
 *
 * @returns {{lat, lon, dias, zona}|null}
 */
export function coordenadasDe(ciudad, departamento) {
  const clave = normalizarCiudad(ciudad);
  if (!clave) return null;

  // 1. Municipio del catálogo del DANE ya descargado. Requiere el departamento
  //    porque hay nombres repetidos en el país (dos "San Pedro", tres "Santa
  //    Rosa"). La caché la llena cargarMunicipios() al abrir el buscador, así
  //    que para cuando se cotiza ya está.
  if (departamento) {
    const depto = departamentoPorNombre(departamento);
    const hit = depto ? municipioEnCache(depto.n, ciudad) : null;
    if (hit) {
      const z = ZONAS_LOGISTICAS[clave] || {};
      return {
        lat: hit.a,
        lon: hit.o,
        dias: z.dias ?? null,
        zona: z.zona ?? null,
        codigo: hit.c,
      };
    }
  }

  // 2. Ciudades delextranjero, que sí traen coordenadas propias.
  const ext = EXTRAS_CON_COORDENADAS[clave];
  if (ext) {
    const z = ZONAS_LOGISTICAS[clave] || {};
    return {
      lat: ext.lat,
      lon: ext.lon,
      dias: z.dias ?? null,
      zona: z.zona ?? null,
    };
  }

  return null;
}

/** Distancia en kilómetros entre dos puntos (fórmula de Haversine). */
export function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0088;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Banda de trayecto según la distancia al centro de acopio.
 *
 * Local hasta `localKm`, regional hasta `regionalKm`, nacional el resto.
 * "Especial" no se deduce: es un interruptor de negocio, igual que en el
 * backend (`app.shipping.special-zone`).
 */
export function bandaDe(km, { especial = false, localKm, regionalKm } = {}) {
  if (especial) return BANDAS_ENVIO.ESPECIAL;
  if (km <= localKm) return BANDAS_ENVIO.LOCAL;
  if (km <= regionalKm) return BANDAS_ENVIO.REGIONAL;
  return BANDAS_ENVIO.NACIONAL;
}

/**
 * Calcula el costo de envío a una ciudad.
 *
 * @param {string} ciudad  Ciudad de destino.
 * @param {object} params  `{precioPorKilometro, costoMinimo, origen, pesoKg}`.
 *   `precioPorKilometro` y `costoMinimo`, si vienen, sobrescriben los de la
 *   banda: son el override que publica la API. `pesoKg` es la cantidad del
 *   pedido, que en AgroMarket ya es en kilos.
 * @returns {{costo:number|null, km:number|null, dias:number|null,
 *            zona:string|null, banda:string|null, conocido:boolean}}
 *   `conocido=false` cuando la ciudad no está en la tabla: en ese caso
 *   `costo` es `null` y quien lo consume debe indicarlo en pantalla en
 *   lugar de mostrar un precio inventado.
 */
export function cotizarEnvio(ciudad, params = {}) {
  const {
    precioPorKilometro = TARIFAS_POR_DEFECTO.precioPorKilometro,
    costoMinimo = TARIFAS_POR_DEFECTO.costoMinimo,
    origen = ORIGEN_POR_DEFECTO,
    pesoKg = 1,
    especial = false,
  } = params;

  const destino = coordenadasDe(ciudad);
  if (!destino) {
    return {
      costo: null, km: null, dias: null, zona: null, banda: null, conocido: false,
    };
  }

  const km = distanciaKm(
    origen.latitude,
    origen.longitude,
    destino.lat,
    destino.lon,
  );

  const banda = bandaDe(km, {
    especial,
    localKm: RADIOS_ENVIO.localKm,
    regionalKm: RADIOS_ENVIO.regionalKm,
  });

  // El peso minimo facturable es 1 kg, igual que en ShippingTariffs: por
  // debajo, la transportadora redondea igual y el despacho se paga entero.
  const pesoCobrable = Math.max(1, Number(pesoKg) || 1);
  const porKg = precioPorKilometro || banda.porKg;
  const minimo = costoMinimo || banda.minimo;

  const costo = Math.max(Math.ceil(porKg * pesoCobrable), minimo);

  return {
    costo,
    km: Math.round(km),
    dias: destino.dias,
    zona: destino.zona,
    banda: banda.etiqueta,
    conocido: true,
  };
}

/**
 * Parámetros de envío tomados del backend.
 *
 * Se resuelve una vez y se reutiliza. Si la API no responde se usan los
 * valores por defecto, que son los mismos que trae `application.yml`
 * (origen en Chigorodó, $1.000/km), para que la pantalla siga siendo
 * coherente con lo que el backend cobrará al confirmar.
 */
let parametrosCache = null;

export async function cargarParametrosEnvio() {
  if (parametrosCache) return parametrosCache;
  try {
    const data = await api.get("/envios/config");
    parametrosCache = {
      precioPorKilometro:
        Number(data?.pricePerKilometer) ||
        TARIFAS_POR_DEFECTO.precioPorKilometro,
      costoMinimo: Number(data?.minimumCost) || TARIFAS_POR_DEFECTO.costoMinimo,
      origen: {
        latitude:
          Number(data?.originLatitude) || ORIGEN_POR_DEFECTO.latitude,
        longitude:
          Number(data?.originLongitude) || ORIGEN_POR_DEFECTO.longitude,
      },
    };
  } catch {
    parametrosCache = {
      precioPorKilometro: TARIFAS_POR_DEFECTO.precioPorKilometro,
      costoMinimo: TARIFAS_POR_DEFECTO.costoMinimo,
      origen: ORIGEN_POR_DEFECTO,
    };
  }
  return parametrosCache;
}
