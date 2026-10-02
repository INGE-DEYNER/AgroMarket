/*
 * Datos de contacto y redes. FUENTE UNICA.
 *
 * Antes cada componente llevaba su propia URL escrita a mano y no coincidian:
 * el footer llamaba al WhatsApp 573127658412 y la pagina de Ayuda al
 * 573001234567. Ninguno de los dos es un numero real de ASAFRUT; son relleno.
 *
 * Eso no es un bug cosmetico. Un boton de "Hablar con soporte" que abre un
 * WhatsApp ajeno manda al cliente a escribirle a un desconocido que no tiene
 * nada que ver con la tienda, y le entrega el numero del negocio. Es peor que
 * no tener el boton.
 *
 * COMO SE USA:
 *   1. Rellena los valores de abajo con los reales de ASAFRUT.
 *   2. While haya un PENDIENTE, los componentes no pintan un enlace pulsable:
 *      en su lugar ofrecen el formulario de reporte, que SI funciona.
 *
 * Para comprobar que nada se dejo sin configurar:
 *   node scripts/revisa-contacto.cjs
 */

/* Poner en null mientras no se sepa el dato real. */
const PENDIENTE = null;

export const CONTACTO = {
  /* Numero de WhatsApp de soporte, solo digitos con codigo pais, sin + ni espacios.
     Ejemplo real: "573001234567". */
  whatsapp: PENDIENTE,

  /* Correo de soporte. */
  email: "soporte@agromarket.co",
};

export const REDES = {
  facebook: "https://www.facebook.com/ASAFRUT67",
  instagram:
    "https://www.instagram.com/asociacion_asafrut/?utm_source=ig_web_button_share_sheet",
  whatsapp: CONTACTO.whatsapp,
};

/* Un numero de WhatsApp solo sirve si se sabe cual es. Si no, null. */
export function enlaceWhatsapp(texto) {
  if (!CONTACTO.whatsapp) return null;
  const base = "https://wa.me/" + CONTACTO.whatsapp;
  return texto ? base + "?text=" + encodeURIComponent(texto) : base;
}

export function whatsappConfigurado() {
  return Boolean(CONTACTO.whatsapp);
}