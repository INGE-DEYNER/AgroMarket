/**
 * Banco de datos de ubicaciones para el formulario de residencia.
 *
 * ESTRUCTURA: pais -> departamentos/estados -> municipios/ciudades.
 *
 * Colombia usa el catálogo oficial del DANE que trae `municipios.generated.js`:
 * 33 departamentos y 1.122 municipios, cada uno con sus coordenadas. Ese
 * archivo se genera con scripts/genera-municipios.cjs; no se edita a mano.
 *
 * Los demás países traen sus ciudades principales, sin coordenadas: AgroMarket
 * opera en Urabá y el envío se cotiza desde ahí, así que un catálogo mundial
 * completo no aporta nada al cálculo y solo engorda el bundle.
 *
 * Es catálogo de referencia, no dato de negocio: por eso vive en el código y
 * no en la base de datos.
 */

import {
  MUNICIPIOS,
  DEPARTAMENTOS as DEPTOS_CO,
} from "./municipios.generated.js";

/*
 * Se re-exportan porque este módulo es la fachada del catálogo: el cotizador de
 * envío necesita consultar municipios por su cuenta, y si tuviera que importar
 * del archivo generado se saltaría las funciones de búsqueda con normalización
 * de acentos que viven aquí.
 */
export { MUNICIPIOS, DEPARTAMENTOS } from "./municipios.generated.js";
export {
  TOTAL_MUNICIPIOS,
  TOTAL_DEPARTAMENTOS,
} from "./municipios.generated.js";

/** Código telefónico de Colombia, único país con catálogo por departamentos. */
export const CODIGO_COLOMBIA = "+57";

/** Países soportados. `codigo` es lo que se guarda en country_code. */
export const PAISES = [
  { codigo: "+57", iso: "CO", nombre: "Colombia", bandera: "CO" },
  { codigo: "+1", iso: "US", nombre: "Estados Unidos", bandera: "US" },
  { codigo: "+34", iso: "ES", nombre: "España", bandera: "ES" },
  { codigo: "+52", iso: "MX", nombre: "México", bandera: "MX" },
  { codigo: "+54", iso: "AR", nombre: "Argentina", bandera: "AR" },
  { codigo: "+56", iso: "CL", nombre: "Chile", bandera: "CL" },
  { codigo: "+51", iso: "PE", nombre: "Perú", bandera: "PE" },
  { codigo: "+58", iso: "VE", nombre: "Venezuela", bandera: "VE" },
];

/**
 * Ciudades principales por país (fuera de Colombia).
 *
 * Sin coordenadas a propósito: ver la nota de la cabecera sobre por qué no se
 * incluye un catálogo mundial. Un destino sin coordenadas hace que el cálculo
 * de envío se bloquee con un mensaje, en vez de mostrar un precio inventado.
 */
const CIUDADES_EXTRAS = {
  "+1": [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
    "Philadelphia", "San Antonio", "San Diego", "Dallas", "Miami",
    "Atlanta", "Boston", "Seattle", "Denver", "Washington",
  ],
  "+34": [
    "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Bilbao",
    "Málaga", "Murcia", "Palma", "Alicante", "Valladolid", "Granada",
  ],
  "+52": [
    "Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana",
    "León", "Juárez", "Zapopan", "Mérida", "Querétaro", "Cancún",
  ],
  "+54": [
    "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata",
    "San Miguel de Tucumán", "Mar del Plata", "Salta", "Santa Fe",
    "Bariloche",
  ],
  "+56": [
    "Santiago", "Valparaíso", "Viña del Mar", "Concepción", "Antofagasta",
    "Temuco", "Rancagua", "Talca", "Arica", "Iquique", "Puerto Montt",
  ],
  "+51": [
    "Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos",
    "Cusco", "Huancayo", "Tacna", "Cajamarca",
  ],
  "+58": [
    "Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay",
    "Ciudad Guayana", "San Cristóbal", "Maturín", "Barcelona", "Cumaná",
  ],
};

const sinAcentos = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Busca un departamento por nombre, tolerando mayúsculas, tildes y espacios.
 *
 * Se usa al leer lo que viene guardado en `users.department`: ese valor lo
 * escribió una versión anterior del formulario, cuando el catálogo tenía
 * nombres como "Bogota D.C." sin tilde. Sin normalizar, esos usuarios no
 * aparecerían en el desplegable y su ciudad quedaría deshabilitada.
 */
export function departamentoPorNombre(nombre) {
  if (!nombre) return null;
  const objetivo = sinAcentos(nombre);
  return (
    DEPTOS_CO.find((d) => sinAcentos(d.n) === objetivo) ||
    DEPTOS_CO.find((d) => sinAcentos(d.n).startsWith(objetivo)) ||
    null
  );
}

/**
 * Busca un municipio dentro de un departamento, con la misma tolerancia.
 *
 * @returns el municipio del catálogo, o null si no existe.
 */
export function municipioPorNombre(departamento, nombre) {
  if (!nombre) return null;
  const depto = departamentoPorNombre(departamento) || { n: departamento };
  const lista = MUNICIPIOS[depto.n]?.ms || [];
  const objetivo = sinAcentos(nombre);
  return (
    lista.find((m) => sinAcentos(m.n) === objetivo) ||
    lista.find((m) => sinAcentos(m.n).startsWith(objetivo)) ||
    null
  );
}

/**
 * Coordenadas de un municipio, para el cálculo de envío.
 *
 * Devuelve `null` si el municipio no está en el catálogo. Quien llama decide
 * qué hacer con ese null; aquí no se inventa una coordenada.
 */
export function coordenadasDeMunicipio(departamento, municipio) {
  const m = municipioPorNombre(departamento, municipio);
  return m ? { lat: m.a, lon: m.o, codigo: m.c } : null;
}

/**
 * Departamentos (o estados/provincias) del país indicado.
 *
 * Solo Colombia tiene el catálogo detallado; el resto usa la división simple
 * "Principal" con sus ciudades principales.
 */
export function departamentosDe(codigoPais) {
  if (codigoPais === CODIGO_COLOMBIA) return DEPTOS_CO.map((d) => d.n);
  return CIUDADES_EXTRAS[codigoPais] ? ["Principal"] : [];
}

/**
 * Municipios (o ciudades) del país y departamento indicados.
 * Para los países sin desglose devuelve la lista de ciudades principales.
 */
export function ciudadesDe(codigoPais, departamento) {
  if (codigoPais === CODIGO_COLOMBIA) {
    const depto = departamentoPorNombre(departamento);
    return depto ? MUNICIPIOS[depto.n]?.ms || [] : [];
  }
  return (CIUDADES_EXTRAS[codigoPais] || []).map((n) => ({
    n,
    c: "",
    a: null,
    o: null,
  }));
}

/** Datos del país a partir del código telefónico. */
export function paisPorCodigo(codigoPais) {
  return PAISES.find((p) => p.codigo === codigoPais) ?? null;
}

/** Bandera ISO del país a partir del código telefónico. */
export function banderaDe(codigoPais) {
  return paisPorCodigo(codigoPais)?.bandera ?? "UN";
}
