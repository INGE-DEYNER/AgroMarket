/**
 * Banco de datos de ubicaciones para el formulario de residencia.
 *
 * ESTRUCTURA: pais -> departamentos/estados -> ciudades/municipios.
 * Los formularios de Registro y Perfil encadenan selects dependientes:
 *   1) Pais        -> PAISES (el codigo va a users.country_code)
 *   2) Departamento -> departamentosDe(codigoPais)
 *   3) Ciudad       -> ciudadesDe(codigoPais, departamento)
 *
 * Colombia trae el catalogo de sus 32 departamentos con sus municipios
 * (el mercado real de AgroMarket es Uraba, Antioquia). Los demas paises
 * traen sus ciudades principales para que el selector nunca quede vacio.
 *
 * Es catalogo de referencia, no dato de negocio: por eso vive en el codigo
 * y no en la base de datos.
 */

/** Codigo telefonico de Colombia, unico pais con catalogo por departamentos. */
export const CODIGO_COLOMBIA = "+57";

/** Paises soportados. `codigo` es lo que se guarda en country_code. */
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

/** Departamentos de Colombia con sus municipios. */
export const COLOMBIA = {
  Antioquia: [
    "Medellín", "Bello", "Itagüí", "Envigado", "Sabaneta", "La Estrella",
    "Copacabana", "Guatapé", "Guarne", "Caldas", "Rionegro",
    "El Carmen de Viboral", "Barbosa", "Concepción", "Andes",
    "Chigorodó", "Turbo", "Apartadó", "CAREPA", "Puerto Berberí",
    "Necoclí", "San Pedro de Urabá", "Arboletes", "Marinilla",
    "San Vicente Ferrer", "La Dorada", "Puerto Triunfo",
  ],
  "Bogota D.C.": ["Bogotá"],
  Atlantico: [
    "Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Puerto Colombia",
    "Candelaria", "Polo", "Juan de Acosta", "Usiacurí", "Galapa",
    "Santa Marta", "Ciénaga", "Tubará",
  ],
  Bolivar: [
    "Cartagena", "Magangué", "Turbaco", "El Carmen de Bolívar",
    "San Jacinto", "Mahates", "Mompos", "Arjona", "Simití", "Pinillos",
    "Achi", "Montería",
  ],
  Boyaca: [
    "Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa", "Raquira",
    "Villavieja", "Miraflores", "Nobsa", "Samacá", "Soracá", "Siachoque",
    "Tununguá", "Ramiriquí", "Guateque", "Somondoco",
  ],
  Caldas: [
    "Manizales", "Chinchiná", "Villamaría", "Riosucio", "Marsella",
    "Salamá", "Victoria", "Viterbo", "La Dorada", "Pereira",
    "Santa Rosa de Cabal", "Dosquebradas",
  ],
  Caqueta: [
    "Florencia", "Belén de La Parrilla", "El Guainía", "Pitalito",
    "Curillo", "Morelia", "Solano", "Valle delguidán",
    "San José del Guaviare",
  ],
  Casanare: ["Yopal", "Arauca", "Paz de Aripao", "Villanueva", "Montería"],
  Cauca: [
    "Popayán", "Santander de Quilichao", "Puerto Tejada", "Piendamó",
    "Timbiquí", "Caldono", "La Vega", "Guachené", "Inzá", "Silvió",
    "Suárez", "Cauca",
  ],
  Cesar: [
    "Valledupar", "Aguachica", "Codazzi", "Chiriguaná", "El Banco",
    "La Jagua de Ibirico", "Manaure", "Dibulla", "Pueblo Bello",
  ],
  Choco: [
    "Quibdó", "Istmina", "Bahía Solano", "El Carmen del Darién",
    "Medellín del Atrato", "Unguía", "Cabo San Juan", "Acandí",
  ],
  Cordoba: [
    "Montería", "Lorica", "Sahagún", "Cereté", "Sincelejo", "Túmpiz",
    "Ciénaga de Oro", "Mompos", "Montelibano", "Pueblo Nuevo",
    "Planeta Rica", "San Carlos", "Caño de los Ujos",
  ],
  Cundinamarca: [
    "Soacha", "Zipaquirá", "Facatativá", "Chía", "Funza", "Fusagasugá",
    "Girardot", "Mota", "Nemeoca", "Pandi", "Pasca", "Puente de los Molinos",
    "Sibundoy", "Villeta", "Vergara", "La Calera", "Ubaté", "Une", "Guasca",
    "Villagarzón",
  ],
  Guainia: ["Inírida", "Cáceres", "Puerrezal"],
  Guaviare: [
    "San José del Guaviare", "Calamar", "El Retorno", "Miraflores",
  ],
  Huila: [
    "Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre", "Palermo",
    "Acevedo", "Agrado", "Almagro", "Suárez", "Tello",
  ],
  "La Guajira": [
    "Riohacha", "Maicao", "Uribia", "Dibulla", "Alta Mira", "Distracción",
    "El Hato", "El Rosario", "La Jagua del Pilar", "Manatí", "Puj",
  ],
  Magdalena: [
    "Santa Marta", "Ciénaga", "Fundación", "El Banco", "Palamino",
    "Santa Ana", "Sierra Nevada", "Cerro San Antonio",
  ],
  Meta: [
    "Villavicencio", "Acacías", "Granada", "Cumaral", "Restrepo", "Fresnes",
    "Mesetas", "San Juan de los Llanos", "Castilla la Nueva",
  ],
  Narino: [
    "Pasto", "Tumaco", "Túquerres", "Ipiales", "La Unión", "Barbacoas",
    "Buga", "Candi", "El Tambo", "Yotoco", "Policarpa", "Fresneda",
  ],
  "Norte de Santander": [
    "Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios",
    "Chitagá", "Ábrego", "Silos", "Salazar",
  ],
  Putumayo: [
    "Mocoa", "Leticia", "San Miguel", "Puerto Asís", "Valle del Guamuez",
    "Piedemonte", "Orteguaza", "Uribe",
  ],
  Quindio: [
    "Armenia", "Calarcá", "Circasia", "Córdoba", "Filandia", "Génova",
    "La Tebaida", "Montenegro", "Pijao", "Salento", "Quindío",
  ],
  Risaralda: [
    "Pereira", "Santa Rosa de Cabal", "Doce Quebradas", "Quimbaya",
    "Mistrató", "La Virginia", "Marsella", "Guatapé",
  ],
  Santander: [
    "Bucaramanga", "Floridablanca", "Barrancabermeja", "Girón",
    "Piedecuesta", "Sucre", "San Gil", "Socotá", "Mogotes", "Vélez",
    "Cerrito", "Los Santos", "Suanda", "Zapatoca",
  ],
  Sucre: [
    "Sincelejo", "Corozal", "Sahagún", "Majagual", "Tolu", "Toluviejas",
    "San Onofre", "Serranía", "El Roble",
  ],
  Tolima: [
    "Ibagué", "Espinal", "Melgar", "Honda", "Ambalá", "Cajamarca",
    "Coello", "Lérida", "Natagaima", "Piedras", "Salgar", "San Antonio",
    "Prado",
  ],
  "Valle del Cauca": [
    "Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga",
    "Jamundí", "Dagua", "Ginebra", "Guacarí", "Pradera", "Restrepo",
    "Riofrío", "Yumbo", "Zarzal", "Versalles",
  ],
  Vaupes: ["Mitú", "Cedral", "Carurú"],
  Vichada: ["Puerto Carreño", "La Primavera", "Santa Rosalía"],
};

/** Ciudades principales por pais (fuera de Colombia). */
const OTROS_PAISES = {
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

/**
 * Departamentos (o estados/provincias) del pais indicado.
 *
 * Solo Colombia tiene el catalogo detallado por departamento; el resto de
 * paises usan la division simple "Principal" con sus ciudades principales.
 */
export function departamentosDe(codigoPais) {
  if (codigoPais === CODIGO_COLOMBIA) return Object.keys(COLOMBIA);
  return OTROS_PAISES[codigoPais] ? ["Principal"] : [];
}

/**
 * Ciudades (o municipios) del pais y departamento indicados.
 * Para los paises sin desglose devuelve la lista de ciudades principales.
 */
export function ciudadesDe(codigoPais, departamento) {
  if (codigoPais === CODIGO_COLOMBIA) {
    return COLOMBIA[departamento] ?? [];
  }
  return OTROS_PAISES[codigoPais] ?? [];
}

/** Datos del pais a partir del codigo telefonico. */
export function paisPorCodigo(codigoPais) {
  return PAISES.find((p) => p.codigo === codigoPais) ?? null;
}

/** Bandera ISO del pais a partir del codigo telefonico. */
export function banderaDe(codigoPais) {
  return paisPorCodigo(codigoPais)?.bandera ?? "UN";
}
