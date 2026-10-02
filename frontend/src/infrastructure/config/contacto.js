/*
 * Datos de contacto y redes. FUENTE UNICA.
 *
 * Antes cada componente llevaba su propia URL escrita a mano y no coincidian:
 * el footer llamaba al WhatsApp 573127658412 y la pagina de Ayuda al
 * 573001234567. El primero resulto ser el bueno de ASAFRUT; el segundo no, y
 * mandaba al cliente a escribirle a un desconocido.
 *
 * Eso no es un bug cosmetico. Un boton de "Hablar con soporte" que abre un
 * WhatsApp ajeno manda al cliente a escribirle a un desconocido que no tiene
 * nada que ver con la tienda, y le entrega el numero del negocio. Es peor que
 * no tener el boton.
 *
 * COMO SE USA:
 *   1. Rellena los valores de abajo con los reales de ASAFRUT.
 *   2. Mientras haya un PENDIENTE, los componentes no pintan un enlace
 *      pulsable: en su lugar ofrecen el formulario de reporte, que SI funciona.
 *
 * Para comprobar que nada se dejo sin configurar:
 *   node scripts/revisa-contacto.cjs
 */

export const CONTACTO = {
  /* WhatsApp de soporte de ASAFRUT.
     Solo digitos, con codigo de pais, sin + ni espacios: wa.me lo necesita asi.
     312 765 8412 (Chigorodo, Antioquia) escrito en internacional = 573127658412. */
  whatsapp: "573127658412",

  /* Correo de soporte. Es el unico dato de contacto que sigue sin confirmar. */
  email: "soporte@agromarket.co",
};

/* El mismo numero, como lo ve la persona que lo lee. Se separa del valor de
   WhatsApp para no reconstruirlo en cada componente: se formatea una vez, y no
   puede quedar "3127658412" en crudo en un pie de pagina. */
const LOCAL = "312 765 8412";
const CON_CODIGO = "+57";

CONTACTO.telefono = "+" + CONTACTO.whatsapp;
CONTACTO.telefonoLegible = CON_CODIGO + " " + LOCAL;

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