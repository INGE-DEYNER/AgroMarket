// ============================================================
// CHATBOT AGROMARKET - DICCIONARIO ES
// ============================================================

const es = [
  // ==========================================================
  // SALUDOS Y CONVERSACIÓN GENERAL
  // ==========================================================

  {
    id: "greeting",
    keywords: [
      "hola",
      "holaa",
      "holaaa",
      "buenas",
      "buenos dias",
      "buenas tardes",
      "buenas noches",
      "hey",
      "hello",
      "que tal",
      "como estas",
      "como esta",
      "saludos",
    ],
    answer:
      "¡Hola! Soy Agro, el asistente virtual de AgroMarket. Estoy aquí para ayudarte con compras, productos, pedidos, pagos, cuenta, productores y cualquier duda sobre la plataforma. ¿Qué necesitas?",
  },

  {
    id: "greeting_morning",
    keywords: ["buenos dias", "buen dia", "hola buenos dias", "buenos días"],
    answer:
      "¡Buenos días! Soy Agro, el asistente virtual de AgroMarket. ¿Quieres buscar productos, revisar un pedido, comprar algo o necesitas ayuda con tu cuenta?",
  },

  {
    id: "greeting_afternoon",
    keywords: ["buenas tardes", "hola buenas tardes"],
    answer:
      "¡Buenas tardes! Soy Agro, el asistente virtual de AgroMarket. Cuéntame qué necesitas y te ayudo a encontrar la opción correcta.",
  },

  {
    id: "greeting_night",
    keywords: ["buenas noches", "hola buenas noches"],
    answer:
      "¡Buenas noches! Soy Agro, el asistente virtual de AgroMarket. ¿Qué necesitas consultar?",
  },

  {
    id: "thanks",
    keywords: [
      "gracias",
      "muchas gracias",
      "te agradezco",
      "gracias por ayudarme",
      "muy amable",
      "excelente gracias",
    ],
    answer:
      "¡Con gusto! Me alegra poder ayudarte. Si necesitas algo más sobre AgroMarket, aquí estoy.",
  },

  {
    id: "bye",
    keywords: [
      "adios",
      "adiós",
      "chao",
      "bye",
      "hasta luego",
      "nos vemos",
      "me voy",
    ],
    answer:
      "¡Hasta luego! Cuando necesites ayuda con AgroMarket, puedes volver a escribirme. ¡Que tengas un buen día!",
  },

  {
    id: "what_are_you",
    keywords: [
      "quien eres",
      "que eres",
      "como te llamas",
      "cual es tu nombre",
      "eres un robot",
      "eres una ia",
      "eres inteligencia artificial",
    ],
    answer:
      "Soy Agro, el asistente virtual de AgroMarket. Puedo orientarte sobre productos, compras, pedidos, pagos, cuenta, productores y las principales funciones de la plataforma.",
  },

  {
    id: "what_is_agromarket",
    keywords: [
      "que es agromarket",
      "que es agro market",
      "para que sirve agromarket",
      "como funciona agromarket",
      "que puedo hacer aqui",
      "que puedo hacer en agromarket",
    ],
    answer:
      "AgroMarket es una plataforma que conecta compradores con productores para facilitar la comercialización de productos agrícolas. Puedes explorar productos, consultar precios, agregarlos al carrito, realizar compras y hacer seguimiento de tus pedidos.",
  },

  // ==========================================================
  // REGISTRO
  // ==========================================================

  {
    id: "register",
    keywords: [
      "registrarme",
      "registrar",
      "crear cuenta",
      "crear usuario",
      "quiero registrarme",
      "como me registro",
      "como crear una cuenta",
      "hacer una cuenta",
      "abrir una cuenta",
      "registro",
    ],
    answer:
      "Crear una cuenta es sencillo. Selecciona 'Registrarse', completa tus datos, crea una contraseña y sigue las instrucciones de verificación. Una vez confirmada tu cuenta podrás utilizar las funciones disponibles de AgroMarket.",
  },

  {
    id: "register_problem",
    keywords: [
      "no puedo registrarme",
      "no me deja registrarme",
      "error al registrarme",
      "error registro",
      "registro no funciona",
      "no puedo crear cuenta",
      "no me deja crear cuenta",
    ],
    answer:
      "Si no puedes registrarte, revisa que todos los campos estén completos y que el correo tenga un formato válido. También verifica que no estés intentando registrar un correo que ya tenga una cuenta. Si el problema continúa, puedes contactar a soporte.",
  },

  {
    id: "already_registered",
    keywords: [
      "ya estoy registrado",
      "ya tengo cuenta",
      "ya tengo usuario",
      "mi correo ya existe",
      "correo ya registrado",
      "email ya registrado",
    ],
    answer:
      "Si tu correo ya está registrado, no necesitas crear otra cuenta. Intenta iniciar sesión con ese correo. Si no recuerdas la contraseña, puedes utilizar la opción '¿Olvidaste tu contraseña?'.",
  },

  // ==========================================================
  // LOGIN
  // ==========================================================

  {
    id: "login",
    keywords: [
      "iniciar sesion",
      "iniciar sesión",
      "login",
      "entrar",
      "ingresar",
      "acceder",
      "quiero entrar",
      "como entro",
      "como inicio sesion",
      "como iniciar sesion",
      "no puedo entrar",
      "no puedo iniciar sesion",
      "no puedo ingresar",
      "problemas para entrar",
      "contrasena",
      "contraseña",
      "password",
    ],
    answer:
      "Para iniciar sesión entra en 'Entrar' y escribe el correo y la contraseña de tu cuenta. Si no recuerdas la contraseña, selecciona '¿Olvidaste tu contraseña?' y sigue las instrucciones para recuperarla.",
  },

  {
    id: "forgot_password",
    keywords: [
      "olvide mi contrasena",
      "olvidé mi contraseña",
      "no recuerdo mi contrasena",
      "no recuerdo la contraseña",
      "recuperar contraseña",
      "recuperar contrasena",
      "cambiar contraseña",
      "restablecer contraseña",
      "resetear contraseña",
      "reset password",
    ],
    answer:
      "Si olvidaste tu contraseña, selecciona '¿Olvidaste tu contraseña?' en la pantalla de inicio de sesión. Introduce el correo de tu cuenta y revisa tu bandeja de entrada para continuar con la recuperación.",
  },

  {
    id: "password_not_received",
    keywords: [
      "no me llega el correo de contraseña",
      "no llega el correo para cambiar contraseña",
      "no recibo el correo de recuperación",
      "no me llega el enlace",
      "no llega el enlace de contraseña",
    ],
    answer:
      "Si no recibes el correo para recuperar tu contraseña, revisa Spam, Promociones o Correo no deseado y confirma que escribiste correctamente tu correo. Si después de unos minutos no aparece, intenta solicitar nuevamente el enlace.",
  },

  {
    id: "account_blocked",
    keywords: [
      "cuenta bloqueada",
      "me bloquearon",
      "usuario bloqueado",
      "no puedo acceder a mi cuenta",
      "mi cuenta esta bloqueada",
      "mi cuenta está bloqueada",
      "bloquearon mi cuenta",
    ],
    answer:
      "Si tu cuenta aparece bloqueada, evita intentar iniciar sesión repetidamente. Espera unos minutos y vuelve a intentarlo. Si el bloqueo continúa, contacta al equipo de soporte para revisar el caso.",
  },

  // ==========================================================
  // CORREO Y VERIFICACIÓN
  // ==========================================================

  {
    id: "email",
    keywords: [
      "correo",
      "email",
      "correo electronico",
      "correo electrónico",
      "verificacion",
      "verificación",
      "confirmar cuenta",
      "confirmar correo",
      "verificar correo",
      "verificar cuenta",
    ],
    answer:
      "La verificación del correo ayuda a confirmar que la cuenta realmente te pertenece. Revisa tu bandeja de entrada y sigue el enlace o código recibido para completar la verificación.",
  },

  {
    id: "email_not_received",
    keywords: [
      "no recibi el correo",
      "no recibí el correo",
      "no me llega el correo",
      "no llega el email",
      "no me llega",
      "no recibo el codigo",
      "no recibí el código",
      "no llega el codigo",
      "no llega el código",
    ],
    answer:
      "Si no recibiste el correo, revisa primero Spam, Promociones y Correo no deseado. Después verifica que el correo registrado sea correcto y solicita nuevamente el código o enlace de verificación.",
  },

  {
    id: "email_spam",
    keywords: [
      "spam",
      "correo en spam",
      "esta en spam",
      "está en spam",
      "correo no deseado",
      "promociones",
    ],
    answer:
      "Sí, algunos correos pueden terminar en Spam, Promociones o Correo no deseado. Revisa esas carpetas antes de solicitar nuevamente el correo de verificación.",
  },

  // ==========================================================
  // PERFIL Y DATOS PERSONALES
  // ==========================================================

  {
    id: "profile",
    keywords: [
      "perfil",
      "mi perfil",
      "ver mi perfil",
      "datos personales",
      "informacion personal",
      "información personal",
      "mis datos",
      "cuenta",
    ],
    answer:
      "Puedes consultar y actualizar la información disponible de tu cuenta desde 'Mi perfil'. Allí podrás modificar los datos que AgroMarket permita editar directamente desde la plataforma.",
  },

  {
    id: "update_profile",
    keywords: [
      "actualizar perfil",
      "actualizar mis datos",
      "cambiar mis datos",
      "editar perfil",
      "modificar perfil",
      "actualizar cuenta",
      "editar cuenta",
      "quiero cambiar mis datos",
    ],
    answer:
      "Para actualizar tus datos entra en 'Mi perfil' y selecciona la opción de edición. Desde allí puedes modificar la información disponible, guardar los cambios y continuar utilizando tu cuenta normalmente.",
  },

  {
    id: "update_name",
    keywords: [
      "cambiar nombre",
      "actualizar nombre",
      "editar nombre",
      "mi nombre esta mal",
      "mi nombre está mal",
    ],
    answer:
      "Puedes modificar tu nombre desde 'Mi perfil', siempre que el campo esté habilitado para edición. Cambia el dato, guarda los cambios y verifica que la información aparezca correctamente.",
  },

  {
    id: "update_phone",
    keywords: [
      "cambiar telefono",
      "cambiar teléfono",
      "actualizar telefono",
      "actualizar teléfono",
      "editar telefono",
      "editar teléfono",
      "cambiar numero",
      "cambiar número",
    ],
    answer:
      "Para actualizar tu teléfono entra en 'Mi perfil', modifica el número y guarda los cambios. Procura mantener un número activo para facilitar cualquier comunicación relacionada con tus pedidos.",
  },

  {
    id: "update_address",
    keywords: [
      "cambiar direccion",
      "cambiar dirección",
      "actualizar direccion",
      "actualizar dirección",
      "editar direccion",
      "editar dirección",
      "cambiar domicilio",
      "nueva direccion",
      "nueva dirección",
    ],
    answer:
      "Puedes actualizar tu dirección desde 'Mi perfil'. Revisa que incluya departamento, ciudad, dirección y referencias necesarias para que la entrega pueda realizarse correctamente.",
  },

  {
    id: "update_photo",
    keywords: [
      "cambiar foto",
      "actualizar foto",
      "editar foto",
      "poner foto",
      "foto de perfil",
      "cambiar imagen",
    ],
    answer:
      "Si la edición de foto está disponible en tu perfil, entra en 'Mi perfil', selecciona tu imagen y guarda los cambios. Usa una imagen clara y compatible con el formato solicitado por la plataforma.",
  },

  {
    id: "delete_account",
    keywords: [
      "eliminar cuenta",
      "borrar cuenta",
      "cerrar cuenta",
      "quiero eliminar mi cuenta",
      "quiero borrar mi cuenta",
      "dar de baja cuenta",
    ],
    answer:
      "Si deseas eliminar tu cuenta, primero verifica si tienes pedidos o procesos pendientes. Para solicitar la eliminación o resolver dudas sobre tus datos personales, contacta al equipo encargado de privacidad y soporte.",
  },

  // ==========================================================
  // PRODUCTOS
  // ==========================================================

  {
    id: "products",
    keywords: [
      "productos",
      "producto",
      "catalogo",
      "catálogo",
      "que venden",
      "que productos tienen",
      "qué productos tienen",
      "ver productos",
      "buscar productos",
    ],
    answer:
      "Puedes explorar los productos disponibles desde el catálogo de AgroMarket. Allí podrás revisar los productos publicados, sus precios, disponibilidad y la información proporcionada por cada productor.",
  },

  {
    id: "search_product",
    keywords: [
      "buscar producto",
      "como busco un producto",
      "donde busco productos",
      "quiero buscar",
      "busco un producto",
      "necesito un producto",
      "encontrar producto",
    ],
    answer:
      "Ve al catálogo y utiliza el buscador para encontrar el producto que necesitas. También puedes explorar las categorías disponibles para encontrar productos más rápidamente.",
  },

  {
    id: "product_price",
    keywords: [
      "precio",
      "precios",
      "cuanto cuesta",
      "cuánto cuesta",
      "cuanto vale",
      "cuánto vale",
      "precio del producto",
      "valor del producto",
    ],
    answer:
      "El precio aparece en la información de cada producto. Ten en cuenta que algunos productos pueden tener precios por kilogramo u otra unidad indicada por el productor.",
  },

  {
    id: "product_stock",
    keywords: [
      "stock",
      "disponibilidad",
      "hay disponibilidad",
      "queda producto",
      "hay producto",
      "producto disponible",
      "disponible",
    ],
    answer:
      "La disponibilidad se muestra en la información del producto. Si un producto aparece sin stock, tendrás que esperar a que el productor actualice su disponibilidad.",
  },

  {
    id: "product_details",
    keywords: [
      "detalles del producto",
      "informacion del producto",
      "información del producto",
      "descripcion",
      "descripción",
      "ver producto",
      "detalle producto",
    ],
    answer:
      "Abre el producto desde el catálogo para consultar sus detalles, precio, disponibilidad y demás información publicada por el productor.",
  },

  // ==========================================================
  // CARRITO
  // ==========================================================

  {
    id: "cart",
    keywords: [
      "carrito",
      "mi carrito",
      "ver carrito",
      "agregar al carrito",
      "añadir al carrito",
      "agregar producto",
      "anadir producto",
      "añadir producto",
      "cart",
    ],
    answer:
      "Para agregar un producto al carrito, abre su página, selecciona la cantidad disponible y pulsa 'Agregar al carrito'. Luego puedes abrir el carrito para revisar o modificar tu compra.",
  },

  {
    id: "cart_quantity",
    keywords: [
      "cambiar cantidad",
      "cantidad carrito",
      "aumentar cantidad",
      "disminuir cantidad",
      "quitar cantidad",
      "cuantos kilos",
      "cuántos kilos",
    ],
    answer:
      "Puedes modificar la cantidad directamente desde el carrito. Ajusta los kilogramos o unidades según la disponibilidad del producto y verifica que el total se actualice correctamente.",
  },

  {
    id: "remove_cart",
    keywords: [
      "eliminar del carrito",
      "quitar del carrito",
      "borrar producto del carrito",
      "sacar producto",
      "quitar producto",
    ],
    answer:
      "Abre tu carrito, localiza el producto que deseas quitar y utiliza la opción de eliminar o retirar. El total de la compra se actualizará automáticamente.",
  },

  {
    id: "empty_cart",
    keywords: [
      "vaciar carrito",
      "borrar carrito",
      "eliminar carrito",
      "quitar todo del carrito",
      "carrito vacio",
      "carrito vacío",
    ],
    answer:
      "Si quieres empezar nuevamente tu compra, puedes retirar los productos del carrito desde la sección 'Carrito'. Revisa el contenido antes de continuar al checkout.",
  },

  {
    id: "cannot_add_cart",
    keywords: [
      "no puedo agregar",
      "no me deja agregar",
      "no puedo añadir",
      "no me deja añadir",
      "error carrito",
      "no funciona el carrito",
    ],
    answer:
      "Si no puedes agregar un producto, verifica primero que tenga stock disponible y que hayas seleccionado una cantidad válida. Si el problema continúa, actualiza la página e intenta nuevamente.",
  },

  // ==========================================================
  // CHECKOUT
  // ==========================================================

  {
    id: "checkout",
    keywords: [
      "checkout",
      "finalizar compra",
      "terminar compra",
      "hacer compra",
      "comprar",
      "como compro",
      "cómo compro",
      "quiero comprar",
    ],
    answer:
      "Para comprar, agrega los productos al carrito, revisa las cantidades, continúa al checkout, confirma tus datos de entrega, selecciona el método de pago y finaliza la compra. Antes de pagar podrás revisar el resumen del pedido.",
  },

  {
    id: "checkout_address",
    keywords: [
      "direccion checkout",
      "dirección checkout",
      "direccion de entrega",
      "dirección de entrega",
      "donde entregan",
      "dónde entregan",
      "lugar de entrega",
    ],
    answer:
      "Durante el checkout debes confirmar la dirección de entrega. Asegúrate de que la ciudad, departamento, dirección y referencias estén completas para evitar inconvenientes con el despacho.",
  },

  {
    id: "checkout_total",
    keywords: [
      "total compra",
      "total del pedido",
      "cuanto voy a pagar",
      "cuánto voy a pagar",
      "valor total",
      "precio final",
      "total carrito",
    ],
    answer:
      "Antes de confirmar el pago podrás ver el resumen de la compra y el valor total. El total puede incluir el valor de los productos y el costo de envío correspondiente.",
  },

  // ==========================================================
  // PAGOS
  // ==========================================================

  {
    id: "payment",
    keywords: [
      "pago",
      "pagar",
      "como pago",
      "cómo pago",
      "formas de pago",
      "metodos de pago",
      "métodos de pago",
      "medio de pago",
      "payment",
    ],
    answer:
      "Puedes realizar el pago mediante los métodos habilitados en el checkout, como PSE, tarjeta Visa/Mastercard, Nequi, Daviplata y Mercado Pago. Selecciona el método que prefieras y sigue las instrucciones.",
  },

  {
    id: "pse",
    keywords: [
      "pse",
      "pagar con pse",
      "pago pse",
      "como pagar por pse",
      "cómo pagar por pse",
    ],
    answer:
      "Para pagar con PSE selecciona PSE durante el checkout y continúa con las instrucciones de la plataforma de pagos. Verifica que los datos de la transacción sean correctos antes de confirmar.",
  },

  {
    id: "card_payment",
    keywords: [
      "tarjeta",
      "pagar con tarjeta",
      "visa",
      "mastercard",
      "credito",
      "crédito",
      "debito",
      "débito",
    ],
    answer:
      "Puedes utilizar una tarjeta Visa o Mastercard si aparece habilitada como método de pago. Durante el checkout introduce los datos solicitados y confirma la transacción.",
  },

  {
    id: "nequi",
    keywords: ["nequi", "pagar con nequi", "pago nequi"],
    answer:
      "Si Nequi está disponible en el checkout, selecciónalo como método de pago y sigue las instrucciones mostradas para completar la transacción.",
  },

  {
    id: "daviplata",
    keywords: ["daviplata", "pagar con daviplata", "pago daviplata"],
    answer:
      "Si Daviplata está disponible en el checkout, selecciónalo y sigue las instrucciones para completar el pago.",
  },

  {
    id: "mercado_pago",
    keywords: [
      "mercado pago",
      "mercadopago",
      "pagar con mercado pago",
      "pago mercado pago",
    ],
    answer:
      "Si Mercado Pago aparece como opción en el checkout, selecciónalo y sigue el proceso indicado para completar tu compra.",
  },

  {
    id: "payment_rejected",
    keywords: [
      "pago rechazado",
      "me rechazaron el pago",
      "no pasa el pago",
      "no puedo pagar",
      "error de pago",
      "pago no funciona",
      "transaccion rechazada",
      "transacción rechazada",
    ],
    answer:
      "Si el pago fue rechazado, verifica los datos utilizados y la disponibilidad de fondos. También puedes intentar nuevamente o seleccionar otro método de pago. Antes de repetir el pago revisa 'Mis pedidos' para confirmar que no se haya generado la orden.",
  },

  {
    id: "payment_pending",
    keywords: [
      "pago pendiente",
      "pago en proceso",
      "transaccion pendiente",
      "transacción pendiente",
      "no se confirma el pago",
      "pago no confirmado",
    ],
    answer:
      "Si el pago aparece pendiente, evita realizar otra transacción inmediatamente. Revisa primero el estado en 'Mis pedidos' y espera la actualización del sistema. Si continúa pendiente, contacta a soporte.",
  },

  {
    id: "payment_duplicate",
    keywords: [
      "me cobraron dos veces",
      "cobro doble",
      "pago duplicado",
      "cobro duplicado",
      "me cobraron de mas",
      "me cobraron dos",
    ],
    answer:
      "Si ves un cobro duplicado, no realices otro pago. Revisa 'Mis pedidos' y conserva los comprobantes de las transacciones. Si ambos cobros aparecen registrados, contacta a soporte para revisar el caso.",
  },

  // ==========================================================
  // PEDIDOS
  // ==========================================================

  {
    id: "order",
    keywords: [
      "pedido",
      "orden",
      "mis pedidos",
      "mi pedido",
      "ver pedido",
      "estado del pedido",
      "seguimiento",
      "rastrear",
      "rastrear pedido",
      "order",
    ],
    answer:
      "Puedes consultar tus pedidos desde 'Mis pedidos'. Allí podrás revisar la información de cada compra y el estado correspondiente.",
  },

  {
    id: "order_not_found",
    keywords: [
      "no aparece mi pedido",
      "mi pedido no aparece",
      "no veo mi pedido",
      "pedido desaparecio",
      "pedido desapareció",
      "no aparece la orden",
      "no veo la orden",
    ],
    answer:
      "Si tu pedido no aparece, confirma primero que el pago haya sido procesado. Después actualiza la página y revisa nuevamente 'Mis pedidos'. Si continúa sin aparecer, contacta a soporte con la información de la compra.",
  },

  {
    id: "order_status",
    keywords: [
      "estado pedido",
      "estado de mi pedido",
      "como va mi pedido",
      "cómo va mi pedido",
      "cuando llega mi pedido",
      "cuándo llega mi pedido",
      "pedido en camino",
    ],
    answer:
      "Puedes consultar el estado de tu pedido desde 'Mis pedidos'. El despacho normalmente tarda entre 24 y 48 horas, dependiendo de la operación y disponibilidad del producto.",
  },

  {
    id: "order_cancel",
    keywords: [
      "cancelar pedido",
      "cancelar orden",
      "quiero cancelar",
      "puedo cancelar mi pedido",
      "anular pedido",
      "anular compra",
    ],
    answer:
      "Si necesitas cancelar un pedido, revisa primero su estado en 'Mis pedidos'. Si todavía permite cancelación, utiliza la opción disponible. Si ya está en proceso de despacho, contacta a soporte para revisar las alternativas.",
  },

  {
    id: "order_history",
    keywords: [
      "historial de pedidos",
      "pedidos anteriores",
      "compras anteriores",
      "historial compras",
      "ver compras",
      "mis compras",
    ],
    answer:
      "Tu historial de compras está disponible en 'Mis pedidos'. Allí puedes consultar las órdenes realizadas y revisar la información asociada a cada una.",
  },

  // ==========================================================
  // ENVÍOS
  // ==========================================================

  {
    id: "shipping",
    keywords: [
      "envio",
      "envío",
      "entrega",
      "despacho",
      "domicilio",
      "shipping",
      "como llega",
      "cómo llega",
      "cuando entregan",
      "cuándo entregan",
    ],
    answer:
      "El costo de envío se calcula durante el checkout. El despacho normalmente tarda entre 24 y 48 horas. Antes de confirmar tu compra revisa cuidadosamente la dirección de entrega.",
  },

  {
    id: "shipping_cost",
    keywords: [
      "cuanto cuesta el envio",
      "cuánto cuesta el envío",
      "precio envio",
      "precio envío",
      "costo envio",
      "costo envío",
      "envio gratis",
      "envío gratis",
    ],
    answer:
      "El costo de envío se calcula durante el checkout según la información de entrega y las condiciones aplicables al pedido. Podrás verlo antes de finalizar la compra.",
  },

  {
    id: "shipping_time",
    keywords: [
      "cuanto demora",
      "cuánto demora",
      "cuanto tarda",
      "cuánto tarda",
      "tiempo de entrega",
      "tiempo envio",
      "tiempo envío",
      "demora envio",
      "demora envío",
    ],
    answer:
      "El despacho normalmente tarda entre 24 y 48 horas. El tiempo puede variar según la disponibilidad del producto y las condiciones de entrega.",
  },

  {
    id: "shipping_address",
    keywords: [
      "direccion envio",
      "dirección envío",
      "direccion entrega",
      "dirección entrega",
      "cambiar direccion de entrega",
      "cambiar dirección de entrega",
      "error en direccion",
      "error en dirección",
    ],
    answer:
      "Verifica la dirección antes de finalizar la compra. Si necesitas modificarla, puedes actualizarla desde tu perfil o durante el proceso de checkout, según las opciones disponibles.",
  },

  // ==========================================================
  // DEVOLUCIONES Y PRODUCTOS EN MAL ESTADO
  // ==========================================================

  {
    id: "returns",
    keywords: [
      "devolucion",
      "devolución",
      "reembolso",
      "refund",
      "return",
      "quiero devolver",
      "devolver producto",
      "devolver pedido",
    ],
    answer:
      "Si necesitas reportar un problema con un producto o solicitar una devolución, utiliza la opción 'Reportar un problema' cuando esté disponible y proporciona la información solicitada. El caso será revisado para determinar la solución correspondiente.",
  },

  {
    id: "damaged_product",
    keywords: [
      "producto danado",
      "producto dañado",
      "producto roto",
      "producto en mal estado",
      "llego danado",
      "llegó dañado",
      "llego malo",
      "llegó malo",
      "producto deteriorado",
    ],
    answer:
      "Si recibiste un producto en mal estado, toma fotografías claras del producto y del pedido y repórtalo lo antes posible mediante 'Reportar un problema'. La evidencia ayudará a revisar el caso y determinar si corresponde una reposición o reembolso.",
  },

  {
    id: "wrong_product",
    keywords: [
      "producto equivocado",
      "me llego otro producto",
      "me llegó otro producto",
      "pedido incorrecto",
      "producto incorrecto",
      "me enviaron algo diferente",
      "recibi otro producto",
    ],
    answer:
      "Si recibiste un producto diferente al solicitado, conserva el pedido y toma fotografías de lo recibido. Repórtalo mediante 'Reportar un problema' para que el caso pueda ser revisado.",
  },

  // ==========================================================
  // DIVISAS
  // ==========================================================

  {
    id: "currency",
    keywords: [
      "divisa",
      "moneda",
      "dolar",
      "dólar",
      "dolares",
      "dólares",
      "euro",
      "euros",
      "cop",
      "usd",
      "eur",
      "precio en",
      "cambiar moneda",
      "cambia la divisa",
      "cambiar divisa",
      "currency",
    ],
    answer:
      "Puedes cambiar la divisa desde el selector de moneda ubicado en la barra superior. AgroMarket permite seleccionar entre COP, USD, EUR, BRL, MXN, CLP, PEN, ARS, CAD, JPY y CNY. Los precios se recalculan según la divisa seleccionada.",
  },

  {
    id: "currency_change",
    keywords: [
      "como cambio la moneda",
      "cómo cambio la moneda",
      "como cambio la divisa",
      "cómo cambio la divisa",
      "donde cambio la moneda",
      "dónde cambio la moneda",
      "quiero dolares",
      "quiero dólares",
      "quiero precios en euros",
    ],
    answer:
      "Busca el selector de divisa en la barra superior, donde normalmente aparece la moneda actual, por ejemplo COP. Selecciona la nueva moneda y los precios se actualizarán.",
  },

  // ==========================================================
  // IDIOMA
  // ==========================================================

  {
    id: "language",
    keywords: [
      "idioma",
      "lenguaje",
      "ingles",
      "inglés",
      "espanol",
      "español",
      "language",
      "traducir",
      "traduccion",
      "traducción",
      "cambiar idioma",
    ],
    answer:
      "Puedes cambiar el idioma desde el selector de idioma de la barra superior. Actualmente puedes utilizar Español e Inglés. Selecciona el idioma que prefieras y la interfaz se actualizará.",
  },

  {
    id: "language_not_change",
    keywords: [
      "no cambia el idioma",
      "no puedo cambiar idioma",
      "idioma no cambia",
      "no funciona el idioma",
      "problema idioma",
      "no se traduce",
    ],
    answer:
      "Si el idioma no cambia, vuelve a seleccionar el idioma desde el selector y actualiza la página. Si continúa igual, prueba cerrar y volver a abrir la sesión. Si el problema persiste, puedes reportarlo a soporte.",
  },

  // ==========================================================
  // FAVORITOS
  // ==========================================================

  {
    id: "favorites",
    keywords: [
      "favoritos",
      "favorito",
      "guardar producto",
      "guardar productos",
      "lista de favoritos",
      "mis favoritos",
      "me gusta producto",
    ],
    answer:
      "Si la función de favoritos está disponible en tu cuenta, puedes guardar productos para encontrarlos fácilmente después. Busca el icono de favorito en la información del producto.",
  },

  // ==========================================================
  // PRODUCTOR / VENDEDOR
  // ==========================================================

  {
    id: "sell",
    keywords: [
      "vender",
      "quiero vender",
      "soy productor",
      "productor",
      "vendedor",
      "publicar producto",
      "publicar productos",
      "vender productos",
      "finca",
      "cosecha",
      "sell",
    ],
    answer:
      "Si eres productor y quieres vender en AgroMarket, debes registrarte con el perfil correspondiente, completar la información de tu perfil y finca y publicar tus productos con sus precios y disponibilidad. Después podrás gestionar los pedidos recibidos.",
  },

  {
    id: "producer_register",
    keywords: [
      "registrarme como productor",
      "crear cuenta productor",
      "quiero ser productor",
      "como ser productor",
      "cómo ser productor",
      "cuenta de productor",
      "registro productor",
    ],
    answer:
      "Para registrarte como productor selecciona la opción de registro correspondiente y completa la información solicitada. Es importante proporcionar datos reales y mantener actualizado tu perfil.",
  },

  {
    id: "publish_product",
    keywords: [
      "publicar producto",
      "subir producto",
      "crear producto",
      "agregar producto como productor",
      "poner producto a la venta",
      "como publico un producto",
      "cómo publico un producto",
    ],
    answer:
      "Si tienes permisos de productor, entra a la sección de gestión de productos y selecciona la opción para crear o publicar un producto. Completa nombre, descripción, precio, unidad, stock e información solicitada antes de guardarlo.",
  },

  {
    id: "update_product",
    keywords: [
      "actualizar producto",
      "editar producto",
      "modificar producto",
      "cambiar precio producto",
      "cambiar stock",
      "actualizar stock",
      "editar precio",
      "modificar precio",
    ],
    answer:
      "Si eres productor, puedes actualizar la información de tus productos desde la sección de gestión correspondiente. Revisa especialmente el precio y el stock para mantener la información disponible para los compradores.",
  },

  {
    id: "producer_orders",
    keywords: [
      "pedidos productor",
      "ventas productor",
      "mis ventas",
      "pedidos recibidos",
      "pedido de comprador",
      "gestionar pedidos",
    ],
    answer:
      "Los productores pueden consultar y gestionar los pedidos recibidos desde la sección correspondiente de su cuenta. Revisa periódicamente los pedidos para mantener actualizada su disponibilidad y estado.",
  },

  // ==========================================================
  // MENSAJES
  // ==========================================================

  {
    id: "messages",
    keywords: [
      "mensaje",
      "mensajes",
      "chat",
      "hablar con productor",
      "contactar productor",
      "contactar vendedor",
      "mensajeria",
      "mensajería",
      "conversacion",
      "conversación",
    ],
    answer:
      "La sección 'Mensajes' permite gestionar las conversaciones disponibles en AgroMarket. Si necesitas comunicarte con un productor o revisar una conversación, entra en esa sección.",
  },

  {
    id: "chat_problem",
    keywords: [
      "chat no funciona",
      "chat no carga",
      "no puedo enviar mensaje",
      "no puedo mandar mensaje",
      "mensajes no cargan",
      "no aparecen mensajes",
    ],
    answer:
      "Si el chat no carga, revisa tu conexión a internet y actualiza la página. Si el problema continúa, cierra sesión, vuelve a entrar e intenta nuevamente.",
  },

  // ==========================================================
  // SOPORTE
  // ==========================================================

  {
    id: "help",
    keywords: [
      "ayuda",
      "soporte",
      "contacto",
      "contactar soporte",
      "necesito ayuda",
      "problema",
      "reportar problema",
      "whatsapp",
      "telefono soporte",
      "teléfono soporte",
      "help",
    ],
    answer:
      "Claro. Puedes utilizar la sección 'Ayuda' o 'Reportar un problema' dentro de AgroMarket. También puedes contactar al soporte por WhatsApp al +57 312 765 8412 o escribir a soporte@agromarket.co.",
  },

  {
    id: "support_email",
    keywords: [
      "correo soporte",
      "email soporte",
      "correo de soporte",
      "soporte por correo",
      "escribir a soporte",
    ],
    answer:
      "Puedes contactar al equipo de soporte escribiendo a soporte@agromarket.co. Describe el problema con el mayor detalle posible e incluye información de tu pedido si está relacionada con una compra.",
  },

  {
    id: "support_whatsapp",
    keywords: [
      "whatsapp soporte",
      "whatsapp",
      "numero soporte",
      "número soporte",
      "telefono soporte",
      "teléfono soporte",
      "contacto whatsapp",
    ],
    answer:
      "Puedes contactar al soporte de AgroMarket por WhatsApp al +57 312 765 8412. Si tu consulta está relacionada con un pedido, ten a mano la información de la orden.",
  },

  // ==========================================================
  // SEGURIDAD
  // ==========================================================

  {
    id: "security",
    keywords: [
      "seguridad",
      "es seguro",
      "mi cuenta es segura",
      "seguridad cuenta",
      "datos seguros",
      "proteccion datos",
      "protección datos",
    ],
    answer:
      "AgroMarket utiliza mecanismos de autenticación y protección para gestionar las cuentas de los usuarios. Como medida de seguridad, utiliza una contraseña personal y evita compartir tus credenciales con otras personas.",
  },

  {
    id: "change_password",
    keywords: [
      "cambiar mi contraseña",
      "cambiar mi contrasena",
      "quiero cambiar contraseña",
      "quiero cambiar contrasena",
      "nueva contraseña",
      "nueva contrasena",
    ],
    answer:
      "Si tienes acceso a tu cuenta, busca la opción correspondiente a seguridad o contraseña dentro de tu perfil. Si no recuerdas tu contraseña actual, utiliza el proceso de recuperación desde la pantalla de inicio de sesión.",
  },

  // ==========================================================
  // FACTURACIÓN
  // ==========================================================

  {
    id: "invoice",
    keywords: [
      "factura",
      "facturacion",
      "facturación",
      "recibo",
      "comprobante",
      "comprobante compra",
      "factura de compra",
    ],
    answer:
      "La información relacionada con tu compra y el comprobante disponible puede consultarse desde el pedido. Si necesitas un documento específico de facturación y no aparece disponible, contacta a soporte.",
  },

  // ==========================================================
  // INFORMACIÓN DE PRODUCTORES
  // ==========================================================

  {
    id: "producer_info",
    keywords: [
      "quien vende",
      "quién vende",
      "quien produce",
      "quién produce",
      "productor del producto",
      "informacion productor",
      "información productor",
      "datos productor",
    ],
    answer:
      "La información del productor puede aparecer en la página de detalle del producto cuando está disponible. Desde allí puedes consultar los datos que el productor haya decidido publicar.",
  },

  // ==========================================================
  // PROBLEMAS GENERALES
  // ==========================================================

  {
    id: "page_not_loading",
    keywords: [
      "pagina no carga",
      "página no carga",
      "web no funciona",
      "la pagina no funciona",
      "la página no funciona",
      "sitio no funciona",
      "no carga",
      "pantalla en blanco",
      "error pagina",
    ],
    answer:
      "Si una página no carga, comprueba tu conexión a internet y actualiza el navegador. Si continúa el problema, prueba cerrar sesión y volver a ingresar. También puedes reportar el error a soporte indicando qué sección estabas utilizando.",
  },

  {
    id: "button_not_working",
    keywords: [
      "boton no funciona",
      "botón no funciona",
      "no funciona el boton",
      "no funciona el botón",
      "no puedo hacer clic",
      "no puedo seleccionar",
      "boton no responde",
      "botón no responde",
    ],
    answer:
      "Si un botón no responde, actualiza la página y vuelve a intentarlo. También puedes comprobar que todos los campos necesarios estén completos. Si sigue sin funcionar, reporta el problema indicando qué botón y qué sección estaban involucrados.",
  },

  {
    id: "error_message",
    keywords: [
      "me sale un error",
      "aparece un error",
      "error en la pagina",
      "error en la página",
      "me da error",
      "sale error",
      "mensaje de error",
    ],
    answer:
      "Si aparece un mensaje de error, revisa el texto mostrado y vuelve a intentar la acción. Si el error continúa, toma una captura de pantalla y repórtalo a soporte para facilitar la identificación del problema.",
  },

  // ==========================================================
  // LOGOUT
  // ==========================================================

  {
    id: "logout",
    keywords: [
      "cerrar sesion",
      "cerrar sesión",
      "salir",
      "salir de mi cuenta",
      "desconectarme",
      "cerrar cuenta temporalmente",
      "logout",
    ],
    answer:
      "Para cerrar sesión, utiliza la opción 'Cerrar sesión' disponible en el menú de tu cuenta. Esto finalizará la sesión actual en el dispositivo.",
  },

  // ==========================================================
  // UBICACIÓN
  // ==========================================================

  {
    id: "location",
    keywords: [
      "ubicacion",
      "ubicación",
      "ciudad",
      "departamento",
      "donde estan",
      "dónde están",
      "donde entregan",
      "dónde entregan",
      "zona de entrega",
    ],
    answer:
      "La disponibilidad de productos y entregas puede depender de la información de ubicación proporcionada durante la compra. Revisa tu ciudad y dirección antes de finalizar el pedido.",
  },

  // ==========================================================
  // DISPONIBILIDAD
  // ==========================================================

  {
    id: "availability",
    keywords: [
      "esta disponible",
      "está disponible",
      "esta abierto",
      "está abierto",
      "funciona ahora",
      "puedo comprar ahora",
      "hay productos",
    ],
    answer:
      "Puedes consultar los productos actualmente disponibles directamente desde el catálogo. La disponibilidad puede cambiar según el stock publicado por los productores.",
  },

  // ==========================================================
  // PROBLEMAS CON EL PEDIDO
  // ==========================================================

  {
    id: "order_problem",
    keywords: [
      "problema con mi pedido",
      "problema pedido",
      "pedido tiene un problema",
      "mi pedido esta mal",
      "mi pedido está mal",
      "error en mi pedido",
      "pedido incorrecto",
    ],
    answer:
      "Si tienes un problema con un pedido, entra en 'Mis pedidos' y revisa su información. Si el problema no se puede solucionar desde allí, utiliza 'Reportar un problema' o contacta a soporte con el número de tu pedido.",
  },

  // ==========================================================
  // AYUDA PARA COMPRAR
  // ==========================================================

  {
    id: "how_to_buy",
    keywords: [
      "como comprar",
      "cómo comprar",
      "pasos para comprar",
      "como hago una compra",
      "cómo hago una compra",
      "quiero hacer una compra",
      "comprar productos",
    ],
    answer:
      "Para comprar en AgroMarket: 1) Busca el producto. 2) Revisa su información y disponibilidad. 3) Agrega la cantidad que necesitas al carrito. 4) Abre el carrito y revisa el pedido. 5) Completa la dirección. 6) Selecciona el método de pago. 7) Confirma la compra.",
  },

  // ==========================================================
  // AYUDA PARA PRODUCTORES
  // ==========================================================

  {
    id: "how_to_sell",
    keywords: [
      "como vender",
      "cómo vender",
      "pasos para vender",
      "quiero vender en agromarket",
      "como publico",
      "cómo publico",
      "quiero ofrecer productos",
    ],
    answer:
      "Para vender en AgroMarket necesitas una cuenta de productor. Completa tu información, registra los productos que deseas ofrecer, indica sus precios y disponibilidad y mantén actualizado el stock para que los compradores puedan realizar pedidos.",
  },

  // ==========================================================
  // PRIVACIDAD
  // ==========================================================

  {
    id: "privacy",
    keywords: [
      "privacidad",
      "datos personales",
      "mis datos",
      "proteccion de datos",
      "protección de datos",
      "politica privacidad",
      "política de privacidad",
    ],
    answer:
      "Para consultas relacionadas con tus datos personales, privacidad o solicitudes de modificación y eliminación de información, puedes contactar al equipo de privacidad en privacidad@agro-market.app.",
  },

  // ==========================================================
  // AGRADECIMIENTO / CONFIRMACIÓN
  // ==========================================================

  {
    id: "ok",
    keywords: [
      "ok",
      "vale",
      "listo",
      "perfecto",
      "entendido",
      "ya entendi",
      "ya entendí",
      "bien",
      "correcto",
    ],
    answer:
      "Perfecto. Si necesitas consultar otra cosa sobre AgroMarket, puedes preguntarme directamente.",
  },

  // ==========================================================
  // NO ENTENDIDO
  // ==========================================================

  {
    id: "unknown",
    keywords: [
      "no se",
      "no sé",
      "ayudame",
      "ayúdame",
      "no entiendo",
      "no entiendo nada",
      "que hago",
      "qué hago",
    ],
    answer:
      "No hay problema. Soy Agro y puedo ayudarte con varias cosas de AgroMarket. Puedes preguntarme, por ejemplo: '¿Cómo compro?', '¿Cómo cambio mi contraseña?', '¿Dónde veo mi pedido?', '¿Cómo cambio mi dirección?', '¿Cómo vendo mis productos?' o '¿Cómo cambio la moneda?'",
  },
];

// ============================================================
// AGROMARKET CHATBOT - ENGLISH DICTIONARY
// ============================================================

const en = [
  // ==========================================================
  // GREETINGS AND GENERAL CONVERSATION
  // ==========================================================

  {
    id: "greeting",
    keywords: [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "how are you",
      "how's it going",
      "greetings",
    ],
    answer:
      "Hi! I'm Agro, AgroMarket's virtual assistant. I can help you with purchases, products, orders, payments, your account, producers, and any questions about the platform. What can I help you with?",
  },

  {
    id: "greeting_morning",
    keywords: [
      "good morning",
      "morning",
      "hello good morning",
      "hi good morning",
    ],
    answer:
      "Good morning! I'm Agro, AgroMarket's virtual assistant. Would you like to search for products, check an order, make a purchase, or get help with your account?",
  },

  {
    id: "greeting_afternoon",
    keywords: ["good afternoon", "hello good afternoon", "hi good afternoon"],
    answer:
      "Good afternoon! I'm Agro, AgroMarket's virtual assistant. Tell me what you need and I'll help you find the right option.",
  },

  {
    id: "greeting_night",
    keywords: [
      "good evening",
      "good night",
      "hello good evening",
      "hi good evening",
    ],
    answer:
      "Good evening! I'm Agro, AgroMarket's virtual assistant. What would you like to know?",
  },

  {
    id: "thanks",
    keywords: [
      "thanks",
      "thank you",
      "thanks a lot",
      "thank you very much",
      "i appreciate it",
      "that's helpful",
      "very helpful",
      "you're very kind",
    ],
    answer:
      "You're welcome! I'm glad I could help. If you need anything else about AgroMarket, just ask.",
  },

  {
    id: "bye",
    keywords: [
      "bye",
      "goodbye",
      "see you",
      "see you later",
      "talk to you later",
      "i'm leaving",
    ],
    answer:
      "See you later! Whenever you need help with AgroMarket, you can come back and ask me. Have a great day!",
  },

  {
    id: "what_are_you",
    keywords: [
      "who are you",
      "what are you",
      "what's your name",
      "what is your name",
      "are you a bot",
      "are you a robot",
      "are you ai",
      "are you artificial intelligence",
    ],
    answer:
      "I'm Agro, AgroMarket's virtual assistant. I can guide you through products, purchases, orders, payments, your account, producers, and the main features of the platform.",
  },

  {
    id: "what_is_agromarket",
    keywords: [
      "what is agromarket",
      "what is agro market",
      "what does agromarket do",
      "how does agromarket work",
      "what can i do here",
      "what can i do on agromarket",
    ],
    answer:
      "AgroMarket is a platform that connects buyers with producers to make agricultural product sales easier. You can browse products, check prices, add products to your cart, make purchases, and track your orders.",
  },

  // ==========================================================
  // REGISTRATION
  // ==========================================================

  {
    id: "register",
    keywords: [
      "register",
      "sign up",
      "create account",
      "create user",
      "i want to register",
      "how do i register",
      "how can i register",
      "how to create an account",
      "make an account",
      "open an account",
      "registration",
    ],
    answer:
      "Creating an account is easy. Select 'Sign Up', enter your information, create a password, and follow the verification instructions. Once your account is confirmed, you'll be able to use the available AgroMarket features.",
  },

  {
    id: "register_problem",
    keywords: [
      "i can't register",
      "i cannot register",
      "registration doesn't work",
      "registration error",
      "error while registering",
      "can't create account",
      "cannot create account",
      "sign up doesn't work",
      "sign up error",
    ],
    answer:
      "If you can't register, make sure all required fields are completed and that your email address is valid. Also check whether the email is already associated with an account. If the problem continues, contact support.",
  },

  {
    id: "already_registered",
    keywords: [
      "i'm already registered",
      "i am already registered",
      "i already have an account",
      "i already have a user",
      "my email already exists",
      "email already registered",
      "email already exists",
    ],
    answer:
      "If your email is already registered, you don't need to create another account. Try signing in with that email. If you don't remember your password, select 'Forgot your password?' to recover it.",
  },

  // ==========================================================
  // LOGIN
  // ==========================================================

  {
    id: "login",
    keywords: [
      "login",
      "log in",
      "sign in",
      "signin",
      "enter",
      "access",
      "get in",
      "how do i log in",
      "how can i log in",
      "how do i sign in",
      "i want to log in",
      "i can't log in",
      "i cannot log in",
      "i can't sign in",
      "i cannot sign in",
      "password",
      "passcode",
    ],
    answer:
      "To sign in, select 'Log In' and enter the email and password associated with your account. If you don't remember your password, select 'Forgot your password?' and follow the recovery instructions.",
  },

  {
    id: "forgot_password",
    keywords: [
      "forgot my password",
      "i forgot my password",
      "forgot password",
      "don't remember my password",
      "do not remember my password",
      "recover password",
      "reset password",
      "change password",
      "password recovery",
      "password reset",
    ],
    answer:
      "If you forgot your password, select 'Forgot your password?' on the login screen. Enter the email associated with your account and check your inbox for the instructions to reset your password.",
  },

  {
    id: "password_not_received",
    keywords: [
      "password email not received",
      "password recovery email not received",
      "i didn't receive the password email",
      "i don't receive the recovery email",
      "recovery link not received",
      "password link not received",
      "reset link not received",
    ],
    answer:
      "If you don't receive the password recovery email, check your Spam, Promotions, or Junk folders and make sure you entered the correct email address. If it still doesn't arrive after a few minutes, request the recovery link again.",
  },

  {
    id: "account_blocked",
    keywords: [
      "account blocked",
      "my account is blocked",
      "my account was blocked",
      "user blocked",
      "i was blocked",
      "they blocked my account",
      "can't access my account",
      "cannot access my account",
    ],
    answer:
      "If your account appears to be blocked, avoid repeatedly trying to log in. Wait a few minutes and try again. If the problem continues, contact support so the team can review your account.",
  },

  // ==========================================================
  // EMAIL AND VERIFICATION
  // ==========================================================

  {
    id: "email",
    keywords: [
      "email",
      "e-mail",
      "email verification",
      "verification",
      "verify account",
      "confirm account",
      "confirm email",
      "verify email",
      "email confirmation",
    ],
    answer:
      "Email verification helps confirm that the account belongs to you. Check your inbox and follow the verification link or enter the code you received to complete the process.",
  },

  {
    id: "email_not_received",
    keywords: [
      "i didn't receive the email",
      "i did not receive the email",
      "email didn't arrive",
      "email did not arrive",
      "i don't receive the email",
      "verification code not received",
      "i didn't receive the code",
      "code didn't arrive",
      "verification email not received",
    ],
    answer:
      "If you didn't receive the email, first check your Spam, Promotions, or Junk folders. Then make sure the email registered on your account is correct and request the verification code or link again.",
  },

  {
    id: "email_spam",
    keywords: [
      "spam",
      "email in spam",
      "it's in spam",
      "junk mail",
      "junk folder",
      "promotions folder",
    ],
    answer:
      "Yes, some emails may end up in Spam, Promotions, or Junk Mail. Check those folders before requesting the verification email again.",
  },

  // ==========================================================
  // PROFILE AND PERSONAL INFORMATION
  // ==========================================================

  {
    id: "profile",
    keywords: [
      "profile",
      "my profile",
      "view my profile",
      "personal information",
      "personal details",
      "my information",
      "my data",
      "account",
    ],
    answer:
      "You can view and update the information available on your account from 'My Profile'. There you'll find the information that AgroMarket allows you to edit directly.",
  },

  {
    id: "update_profile",
    keywords: [
      "update profile",
      "update my information",
      "change my information",
      "edit profile",
      "modify profile",
      "update account",
      "edit account",
      "change my details",
      "update my details",
    ],
    answer:
      "To update your information, go to 'My Profile' and select the edit option. From there you can modify the available information, save your changes, and continue using your account.",
  },

  {
    id: "update_name",
    keywords: [
      "change name",
      "update name",
      "edit name",
      "my name is wrong",
      "my name is incorrect",
      "wrong name",
      "incorrect name",
    ],
    answer:
      "You can change your name from 'My Profile' if the field is available for editing. Update the information, save your changes, and check that the new name appears correctly.",
  },

  {
    id: "update_phone",
    keywords: [
      "change phone",
      "change phone number",
      "update phone",
      "update phone number",
      "edit phone",
      "edit phone number",
      "change number",
      "new phone number",
    ],
    answer:
      "To update your phone number, go to 'My Profile', edit the number, and save the changes. Make sure you keep an active phone number for communications related to your orders.",
  },

  {
    id: "update_address",
    keywords: [
      "change address",
      "update address",
      "edit address",
      "change my address",
      "new address",
      "change delivery address",
      "update delivery address",
      "modify address",
    ],
    answer:
      "You can update your address from 'My Profile'. Make sure it includes the department, city, street address, and any useful delivery references.",
  },

  {
    id: "update_photo",
    keywords: [
      "change photo",
      "update photo",
      "edit photo",
      "profile picture",
      "change profile picture",
      "change image",
      "update image",
    ],
    answer:
      "If profile photo editing is available, go to 'My Profile', select your image, and save the changes. Use a clear image in a format supported by the platform.",
  },

  {
    id: "delete_account",
    keywords: [
      "delete account",
      "remove account",
      "close account",
      "i want to delete my account",
      "i want to remove my account",
      "deactivate account",
      "close my account",
    ],
    answer:
      "If you want to delete your account, first make sure you don't have pending orders or ongoing processes. To request account deletion or ask about your personal data, contact the privacy and support team.",
  },

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  {
    id: "products",
    keywords: [
      "products",
      "product",
      "catalog",
      "catalogue",
      "what do you sell",
      "what products do you have",
      "what can i buy",
      "show products",
      "browse products",
    ],
    answer:
      "You can explore the products available on AgroMarket through the catalog. There you can check products, prices, availability, and information provided by each producer.",
  },

  {
    id: "search_product",
    keywords: [
      "search product",
      "find product",
      "how do i search for a product",
      "where can i search for products",
      "i want to search",
      "i'm looking for a product",
      "i am looking for a product",
      "find a product",
      "look for product",
    ],
    answer:
      "Go to the catalog and use the search bar to find the product you need. You can also browse the available categories to find products more quickly.",
  },

  {
    id: "product_price",
    keywords: [
      "price",
      "prices",
      "how much does it cost",
      "how much is it",
      "product price",
      "price of the product",
      "product cost",
      "cost of product",
    ],
    answer:
      "The price is displayed in the product information. Keep in mind that some products may be priced per kilogram or according to another unit specified by the producer.",
  },

  {
    id: "product_stock",
    keywords: [
      "stock",
      "availability",
      "is it available",
      "is this available",
      "do you have this product",
      "is the product available",
      "product available",
      "available",
    ],
    answer:
      "Product availability is shown in the product information. If a product is out of stock, you'll need to wait until the producer updates its availability.",
  },

  {
    id: "product_details",
    keywords: [
      "product details",
      "product information",
      "description",
      "product description",
      "view product",
      "product detail",
      "more information about product",
    ],
    answer:
      "Open the product from the catalog to see its details, price, availability, description, and other information provided by the producer.",
  },

  // ==========================================================
  // CART
  // ==========================================================

  {
    id: "cart",
    keywords: [
      "cart",
      "shopping cart",
      "my cart",
      "view cart",
      "add to cart",
      "add product",
      "add item",
      "shopping bag",
    ],
    answer:
      "To add a product to your cart, open its product page, select the available quantity, and click 'Add to Cart'. You can then open your cart to review or change your purchase.",
  },

  {
    id: "cart_quantity",
    keywords: [
      "change quantity",
      "cart quantity",
      "increase quantity",
      "decrease quantity",
      "remove quantity",
      "how many kilos",
      "how much should i buy",
      "change amount",
    ],
    answer:
      "You can change the quantity directly from your cart. Adjust the kilograms or units according to the product's availability and check that the total updates correctly.",
  },

  {
    id: "remove_cart",
    keywords: [
      "remove from cart",
      "delete from cart",
      "remove product from cart",
      "remove item",
      "take product out",
      "delete product from cart",
    ],
    answer:
      "Open your cart, find the product you want to remove, and use the remove or delete option. The purchase total will update automatically.",
  },

  {
    id: "empty_cart",
    keywords: [
      "empty cart",
      "clear cart",
      "delete cart",
      "remove everything from cart",
      "empty my cart",
      "clear my shopping cart",
    ],
    answer:
      "If you want to start your purchase again, remove the products from your cart. Review the cart contents before continuing to checkout.",
  },

  {
    id: "cannot_add_cart",
    keywords: [
      "can't add to cart",
      "cannot add to cart",
      "can't add product",
      "cannot add product",
      "cart error",
      "cart doesn't work",
      "add to cart doesn't work",
    ],
    answer:
      "If you can't add a product, first check that it has available stock and that you've selected a valid quantity. If the problem continues, refresh the page and try again.",
  },

  // ==========================================================
  // CHECKOUT
  // ==========================================================

  {
    id: "checkout",
    keywords: [
      "checkout",
      "finish purchase",
      "complete purchase",
      "complete order",
      "make a purchase",
      "buy",
      "how do i buy",
      "how can i buy",
      "i want to buy",
    ],
    answer:
      "To make a purchase, add your products to the cart, review the quantities, continue to checkout, confirm your delivery information, select a payment method, and complete the purchase. You'll be able to review the order summary before paying.",
  },

  {
    id: "checkout_address",
    keywords: [
      "checkout address",
      "delivery address",
      "where do you deliver",
      "where can you deliver",
      "delivery location",
      "address during checkout",
    ],
    answer:
      "During checkout, you need to confirm your delivery address. Make sure the city, department, street address, and delivery references are complete before placing the order.",
  },

  {
    id: "checkout_total",
    keywords: [
      "purchase total",
      "order total",
      "how much will i pay",
      "what will i pay",
      "total value",
      "final price",
      "cart total",
      "final total",
    ],
    answer:
      "Before confirming your payment, you'll see the purchase summary and total amount. The total may include the product prices and the applicable shipping cost.",
  },

  // ==========================================================
  // PAYMENTS
  // ==========================================================

  {
    id: "payment",
    keywords: [
      "payment",
      "pay",
      "how do i pay",
      "how can i pay",
      "payment methods",
      "ways to pay",
      "payment options",
    ],
    answer:
      "You can pay using the methods available at checkout, such as PSE, Visa/Mastercard, Nequi, Daviplata, and Mercado Pago. Select your preferred method and follow the instructions.",
  },

  {
    id: "pse",
    keywords: [
      "pse",
      "pay with pse",
      "pse payment",
      "how to pay with pse",
      "payment using pse",
    ],
    answer:
      "To pay with PSE, select PSE during checkout and follow the instructions provided by the payment platform. Check the transaction details carefully before confirming.",
  },

  {
    id: "card_payment",
    keywords: [
      "card",
      "pay by card",
      "pay with card",
      "visa",
      "mastercard",
      "credit card",
      "debit card",
      "credit",
      "debit",
    ],
    answer:
      "You can use a Visa or Mastercard if it is available as a payment option. During checkout, enter the requested card information and confirm the transaction.",
  },

  {
    id: "nequi",
    keywords: [
      "nequi",
      "pay with nequi",
      "nequi payment",
      "nequi payment method",
    ],
    answer:
      "If Nequi is available at checkout, select it as your payment method and follow the instructions shown to complete the transaction.",
  },

  {
    id: "daviplata",
    keywords: [
      "daviplata",
      "pay with daviplata",
      "daviplata payment",
      "daviplata payment method",
    ],
    answer:
      "If Daviplata is available at checkout, select it as your payment method and follow the instructions to complete the payment.",
  },

  {
    id: "mercado_pago",
    keywords: [
      "mercado pago",
      "mercadopago",
      "pay with mercado pago",
      "mercado pago payment",
      "mercadopago payment",
    ],
    answer:
      "If Mercado Pago is available at checkout, select it and follow the instructions provided to complete your payment.",
  },

  {
    id: "payment_rejected",
    keywords: [
      "payment rejected",
      "my payment was rejected",
      "payment doesn't go through",
      "can't pay",
      "cannot pay",
      "payment error",
      "payment doesn't work",
      "transaction rejected",
      "card payment rejected",
    ],
    answer:
      "If your payment was rejected, check the payment information and make sure you have sufficient funds. You can also try again or select another payment method. Before trying again, check 'My Orders' to make sure the order wasn't already created.",
  },

  {
    id: "payment_pending",
    keywords: [
      "payment pending",
      "payment processing",
      "transaction pending",
      "payment not confirmed",
      "payment hasn't been confirmed",
      "payment still pending",
    ],
    answer:
      "If your payment is pending, avoid making another payment immediately. First check the order status in 'My Orders' and wait for the system to update. If it remains pending, contact support.",
  },

  {
    id: "payment_duplicate",
    keywords: [
      "charged twice",
      "double charge",
      "duplicate payment",
      "duplicate charge",
      "charged too much",
      "i was charged twice",
      "two charges",
    ],
    answer:
      "If you see a duplicate charge, don't make another payment. Check 'My Orders' and keep your transaction receipts. If both charges are confirmed, contact support so the case can be reviewed.",
  },

  // ==========================================================
  // ORDERS
  // ==========================================================

  {
    id: "order",
    keywords: [
      "order",
      "orders",
      "my orders",
      "my order",
      "view order",
      "order status",
      "tracking",
      "track order",
      "order tracking",
    ],
    answer:
      "You can check your orders from 'My Orders'. There you'll be able to review your purchases and see the current status of each order.",
  },

  {
    id: "order_not_found",
    keywords: [
      "my order is missing",
      "my order doesn't appear",
      "my order does not appear",
      "i can't see my order",
      "order disappeared",
      "my order is not showing",
      "i don't see my order",
      "order not found",
    ],
    answer:
      "If your order doesn't appear, first confirm that the payment was processed. Then refresh the page and check 'My Orders' again. If it still doesn't appear, contact support with your purchase information.",
  },

  {
    id: "order_status",
    keywords: [
      "order status",
      "status of my order",
      "how is my order",
      "where is my order",
      "when will my order arrive",
      "when will it arrive",
      "order on the way",
      "order is on the way",
    ],
    answer:
      "You can check your order status from 'My Orders'. Shipping normally takes between 24 and 48 hours, depending on the operation and product availability.",
  },

  {
    id: "order_cancel",
    keywords: [
      "cancel order",
      "cancel my order",
      "cancel purchase",
      "i want to cancel",
      "can i cancel my order",
      "cancel order please",
      "void order",
    ],
    answer:
      "If you need to cancel an order, first check its status in 'My Orders'. If cancellation is still available, use the corresponding option. If the order is already being shipped, contact support to review the available options.",
  },

  {
    id: "order_history",
    keywords: [
      "order history",
      "previous orders",
      "past orders",
      "purchase history",
      "previous purchases",
      "my purchases",
      "purchase history",
    ],
    answer:
      "Your purchase history is available in 'My Orders'. There you can review previous orders and the information associated with each purchase.",
  },

  // ==========================================================
  // SHIPPING
  // ==========================================================

  {
    id: "shipping",
    keywords: [
      "shipping",
      "delivery",
      "shipment",
      "dispatch",
      "home delivery",
      "how does delivery work",
      "when do you deliver",
      "when will you deliver",
    ],
    answer:
      "Shipping costs are calculated during checkout. Delivery normally takes between 24 and 48 hours. Before confirming your purchase, carefully check your delivery address.",
  },

  {
    id: "shipping_cost",
    keywords: [
      "how much is shipping",
      "shipping cost",
      "shipping price",
      "delivery cost",
      "delivery price",
      "is shipping free",
      "free shipping",
    ],
    answer:
      "Shipping costs are calculated during checkout based on the delivery information and applicable conditions. You'll be able to see the shipping cost before completing your purchase.",
  },

  {
    id: "shipping_time",
    keywords: [
      "how long does shipping take",
      "how long does delivery take",
      "how long will it take",
      "delivery time",
      "shipping time",
      "shipping delay",
      "delivery delay",
      "how many days for delivery",
    ],
    answer:
      "Shipping normally takes between 24 and 48 hours. Delivery times may vary depending on product availability and delivery conditions.",
  },

  {
    id: "shipping_address",
    keywords: [
      "shipping address",
      "delivery address",
      "change delivery address",
      "wrong address",
      "address error",
      "incorrect address",
      "update shipping address",
    ],
    answer:
      "Check your delivery address before completing your purchase. You may be able to update it from your profile or during checkout, depending on the available options.",
  },

  // ==========================================================
  // RETURNS AND DAMAGED PRODUCTS
  // ==========================================================

  {
    id: "returns",
    keywords: [
      "return",
      "returns",
      "refund",
      "refunds",
      "return product",
      "return order",
      "i want to return",
      "send product back",
    ],
    answer:
      "If you need to report a product problem or request a return, use 'Report a Problem' when available and provide the requested information. The case will be reviewed to determine the appropriate solution.",
  },

  {
    id: "damaged_product",
    keywords: [
      "damaged product",
      "broken product",
      "product arrived damaged",
      "product arrived broken",
      "product is damaged",
      "product is in bad condition",
      "bad condition",
      "damaged order",
    ],
    answer:
      "If you received a damaged or poor-condition product, take clear photos of the product and order and report the issue as soon as possible through 'Report a Problem'. The evidence will help the team review the case and determine whether a replacement or refund applies.",
  },

  {
    id: "wrong_product",
    keywords: [
      "wrong product",
      "wrong item",
      "i received another product",
      "i received the wrong product",
      "incorrect order",
      "different product",
      "they sent me something different",
    ],
    answer:
      "If you received a different product from the one you ordered, keep the order and take clear photos of what you received. Report the issue through 'Report a Problem' so the case can be reviewed.",
  },

  // ==========================================================
  // CURRENCY
  // ==========================================================

  {
    id: "currency",
    keywords: [
      "currency",
      "money",
      "dollar",
      "dollars",
      "euro",
      "euros",
      "cop",
      "usd",
      "eur",
      "price in",
      "change currency",
      "switch currency",
      "currency selector",
    ],
    answer:
      "You can change the currency using the currency selector in the top navigation bar. AgroMarket supports COP, USD, EUR, BRL, MXN, CLP, PEN, ARS, CAD, JPY, and CNY. Prices are recalculated according to the selected currency.",
  },

  {
    id: "currency_change",
    keywords: [
      "how do i change currency",
      "how can i change currency",
      "where do i change currency",
      "where can i change currency",
      "i want dollars",
      "i want prices in dollars",
      "i want prices in euros",
      "show prices in usd",
      "show prices in euros",
    ],
    answer:
      "Look for the currency selector in the top navigation bar, where the current currency is displayed, such as COP. Select the currency you want and the prices will update.",
  },

  // ==========================================================
  // LANGUAGE
  // ==========================================================

  {
    id: "language",
    keywords: [
      "language",
      "english",
      "spanish",
      "español",
      "espanol",
      "translation",
      "translate",
      "change language",
      "switch language",
      "language selector",
    ],
    answer:
      "You can change the language using the language selector in the top navigation bar. AgroMarket currently supports Spanish and English. Select your preferred language and the interface will update.",
  },

  {
    id: "language_not_change",
    keywords: [
      "language won't change",
      "language doesn't change",
      "can't change language",
      "cannot change language",
      "language is not changing",
      "language problem",
      "translation doesn't work",
      "not translated",
    ],
    answer:
      "If the language doesn't change, select the language again and refresh the page. You can also try signing out and signing back in. If the problem continues, report it to support.",
  },

  // ==========================================================
  // FAVORITES
  // ==========================================================

  {
    id: "favorites",
    keywords: [
      "favorites",
      "favorite",
      "save product",
      "save products",
      "favorites list",
      "my favorites",
      "favorite products",
      "like product",
    ],
    answer:
      "If the favorites feature is available on your account, you can save products to find them more easily later. Look for the favorite icon on the product information page.",
  },

  // ==========================================================
  // PRODUCER / SELLER
  // ==========================================================

  {
    id: "sell",
    keywords: [
      "sell",
      "i want to sell",
      "i am a producer",
      "producer",
      "seller",
      "publish product",
      "publish products",
      "sell products",
      "farm",
      "harvest",
    ],
    answer:
      "If you're a producer and want to sell on AgroMarket, register with the appropriate profile, complete your producer and farm information, and publish your products with their prices and availability. You can then manage the orders you receive.",
  },

  {
    id: "producer_register",
    keywords: [
      "register as producer",
      "sign up as producer",
      "create producer account",
      "i want to be a producer",
      "how to become a producer",
      "producer account",
      "producer registration",
    ],
    answer:
      "To register as a producer, select the appropriate registration option and complete the requested information. Make sure the information you provide is accurate and keep your profile updated.",
  },

  {
    id: "publish_product",
    keywords: [
      "publish product",
      "upload product",
      "create product",
      "add product as producer",
      "put product for sale",
      "how do i publish a product",
      "how can i publish a product",
    ],
    answer:
      "If you have producer permissions, go to the product management section and select the option to create or publish a product. Complete the name, description, price, unit, stock, and other required information before saving it.",
  },

  {
    id: "update_product",
    keywords: [
      "update product",
      "edit product",
      "modify product",
      "change product price",
      "change stock",
      "update stock",
      "edit price",
      "modify price",
    ],
    answer:
      "If you're a producer, you can update your product information from the product management section. Pay special attention to price and stock so buyers always see accurate information.",
  },

  {
    id: "producer_orders",
    keywords: [
      "producer orders",
      "seller orders",
      "my sales",
      "orders received",
      "buyer order",
      "manage orders",
      "manage sales",
    ],
    answer:
      "Producers can view and manage received orders from the corresponding section of their account. Check your orders regularly to keep product availability and order status up to date.",
  },

  // ==========================================================
  // MESSAGES
  // ==========================================================

  {
    id: "messages",
    keywords: [
      "message",
      "messages",
      "chat",
      "talk to producer",
      "contact producer",
      "contact seller",
      "messaging",
      "conversation",
      "chat with producer",
    ],
    answer:
      "The 'Messages' section allows you to manage conversations available on AgroMarket. If you need to contact a producer or review a conversation, open that section.",
  },

  {
    id: "chat_problem",
    keywords: [
      "chat doesn't work",
      "chat doesn't load",
      "can't send message",
      "cannot send message",
      "messages don't load",
      "messages not loading",
      "messages don't appear",
      "chat problem",
    ],
    answer:
      "If the chat doesn't load, check your internet connection and refresh the page. If the problem continues, sign out, sign back in, and try again.",
  },

  // ==========================================================
  // SUPPORT
  // ==========================================================

  {
    id: "help",
    keywords: [
      "help",
      "support",
      "contact",
      "contact support",
      "i need help",
      "problem",
      "report problem",
      "whatsapp",
      "support phone",
      "support number",
    ],
    answer:
      "Of course. You can use the 'Help' or 'Report a Problem' sections in AgroMarket. You can also contact support through WhatsApp at +57 312 765 8412 or email support@agromarket.co.",
  },

  {
    id: "support_email",
    keywords: [
      "support email",
      "support email address",
      "email support",
      "contact support by email",
      "write to support",
    ],
    answer:
      "You can contact AgroMarket support at support@agromarket.co. Describe the problem in as much detail as possible and include your order information if your question is related to a purchase.",
  },

  {
    id: "support_whatsapp",
    keywords: [
      "support whatsapp",
      "whatsapp support",
      "support number",
      "support phone",
      "phone support",
      "whatsapp number",
      "contact whatsapp",
    ],
    answer:
      "You can contact AgroMarket support through WhatsApp at +57 312 765 8412. If your question is related to an order, have your order information ready.",
  },

  // ==========================================================
  // SECURITY
  // ==========================================================

  {
    id: "security",
    keywords: [
      "security",
      "is it safe",
      "is my account safe",
      "account security",
      "data security",
      "data protection",
      "personal data protection",
    ],
    answer:
      "AgroMarket uses authentication and protection mechanisms to manage user accounts. As a security measure, use a personal password and never share your login credentials with other people.",
  },

  {
    id: "change_password",
    keywords: [
      "change my password",
      "change password",
      "i want to change my password",
      "new password",
      "update password",
      "edit password",
    ],
    answer:
      "If you can access your account, look for the security or password option in your profile. If you don't remember your current password, use the password recovery process from the login screen.",
  },

  // ==========================================================
  // BILLING
  // ==========================================================

  {
    id: "invoice",
    keywords: [
      "invoice",
      "billing",
      "receipt",
      "payment receipt",
      "purchase receipt",
      "invoice for purchase",
      "billing information",
    ],
    answer:
      "Purchase information and available receipts can be checked from your order. If you need a specific billing document and it isn't available, contact support.",
  },

  // ==========================================================
  // PRODUCER INFORMATION
  // ==========================================================

  {
    id: "producer_info",
    keywords: [
      "who sells this",
      "who is the seller",
      "who produces this",
      "who made this",
      "product producer",
      "producer information",
      "producer details",
      "seller information",
    ],
    answer:
      "Producer information may appear on the product detail page when available. There you can see the information that the producer has chosen to make public.",
  },

  // ==========================================================
  // GENERAL PROBLEMS
  // ==========================================================

  {
    id: "page_not_loading",
    keywords: [
      "page doesn't load",
      "page does not load",
      "website doesn't work",
      "website is not working",
      "site doesn't work",
      "site is down",
      "nothing loads",
      "blank screen",
      "page error",
    ],
    answer:
      "If a page doesn't load, check your internet connection and refresh the browser. If the problem continues, try signing out and signing back in. You can also report the error to support and mention which section you were using.",
  },

  {
    id: "button_not_working",
    keywords: [
      "button doesn't work",
      "button does not work",
      "button isn't working",
      "can't click button",
      "cannot click button",
      "can't select",
      "button not responding",
      "button doesn't respond",
    ],
    answer:
      "If a button doesn't respond, refresh the page and try again. Also check that all required fields have been completed. If it still doesn't work, report the problem and mention which button and section were involved.",
  },

  {
    id: "error_message",
    keywords: [
      "i get an error",
      "an error appears",
      "error on the page",
      "page error",
      "it gives me an error",
      "error message",
      "system error",
      "something went wrong",
    ],
    answer:
      "If an error message appears, check the message shown and try the action again. If the error continues, take a screenshot and report it to support so the problem can be identified more easily.",
  },

  // ==========================================================
  // LOGOUT
  // ==========================================================

  {
    id: "logout",
    keywords: [
      "log out",
      "logout",
      "sign out",
      "exit",
      "leave my account",
      "disconnect",
      "close session",
    ],
    answer:
      "To log out, use the 'Log Out' option available in your account menu. This will end your current session on the device.",
  },

  // ==========================================================
  // LOCATION
  // ==========================================================

  {
    id: "location",
    keywords: [
      "location",
      "where are you located",
      "city",
      "department",
      "where do you deliver",
      "delivery area",
      "delivery zone",
      "service area",
    ],
    answer:
      "Product and delivery availability may depend on the location information provided during your purchase. Check your city and delivery address before completing your order.",
  },

  // ==========================================================
  // AVAILABILITY
  // ==========================================================

  {
    id: "availability",
    keywords: [
      "is it available",
      "are you open",
      "is it open",
      "does it work now",
      "can i buy now",
      "are there products",
      "available products",
      "availability",
    ],
    answer:
      "You can check the products currently available directly in the catalog. Availability may change depending on the stock reported by producers.",
  },

  // ==========================================================
  // ORDER PROBLEMS
  // ==========================================================

  {
    id: "order_problem",
    keywords: [
      "problem with my order",
      "order problem",
      "there is a problem with my order",
      "my order is wrong",
      "wrong order",
      "error in my order",
      "order issue",
      "issue with order",
    ],
    answer:
      "If you have a problem with an order, open 'My Orders' and review the order information. If the issue can't be solved there, use 'Report a Problem' or contact support with your order number.",
  },

  // ==========================================================
  // HELP WITH BUYING
  // ==========================================================

  {
    id: "how_to_buy",
    keywords: [
      "how to buy",
      "how can i buy",
      "how do i make a purchase",
      "steps to buy",
      "how do i purchase",
      "i want to make a purchase",
      "buy products",
      "purchase products",
    ],
    answer:
      "To buy on AgroMarket: 1) Search for a product. 2) Review its information and availability. 3) Add the quantity you need to your cart. 4) Open the cart and review your order. 5) Enter your delivery address. 6) Select a payment method. 7) Confirm your purchase.",
  },

  // ==========================================================
  // HELP FOR PRODUCERS
  // ==========================================================

  {
    id: "how_to_sell",
    keywords: [
      "how to sell",
      "how can i sell",
      "steps to sell",
      "i want to sell on agromarket",
      "how do i publish",
      "how can i publish",
      "i want to offer products",
      "sell on agromarket",
    ],
    answer:
      "To sell on AgroMarket, you need a producer account. Complete your information, register the products you want to offer, enter their prices and availability, and keep your stock updated so buyers can place orders.",
  },

  // ==========================================================
  // PRIVACY
  // ==========================================================

  {
    id: "privacy",
    keywords: [
      "privacy",
      "personal data",
      "my personal data",
      "data protection",
      "privacy policy",
      "personal information",
      "data privacy",
    ],
    answer:
      "For questions about your personal data, privacy, or requests to modify or delete your information, contact the privacy team at privacidad@agro-market.app.",
  },

  // ==========================================================
  // ACKNOWLEDGEMENT / CONFIRMATION
  // ==========================================================

  {
    id: "ok",
    keywords: [
      "ok",
      "okay",
      "alright",
      "all right",
      "got it",
      "understood",
      "i understand",
      "perfect",
      "good",
      "correct",
    ],
    answer: "Perfect. If you need anything else about AgroMarket, just ask me.",
  },

  // ==========================================================
  // USER DOESN'T KNOW WHAT TO ASK
  // ==========================================================

  {
    id: "unknown",
    keywords: [
      "i don't know",
      "i dont know",
      "help me",
      "i need help",
      "i don't understand",
      "i dont understand",
      "what should i do",
      "what do i do",
    ],
    answer:
      "No problem. I'm Agro, and I can help you with AgroMarket. You can ask me things like: 'How do I buy?', 'How do I change my password?', 'Where can I see my order?', 'How do I change my address?', 'How do I sell my products?', or 'How do I change the currency?'",
  },
];

// PT
const pt = [
  {
    id: "login",
    keywords: [
      "entrar",
      "login",
      "acessar",
      "senha",
      "nao consigo entrar",
      "conta bloqueada",
    ],
    answer:
      "Para entrar: 1) Vai a Entrar. 2) Coloca e-mail e senha. 3) Usa Esqueci a senha. Se bloqueada, espera 15 min ou escreve a soporte@agromarket.co.",
  },
  {
    id: "email",
    keywords: [
      "e-mail",
      "email",
      "verificacao",
      "nao recebi",
      "spam",
      "confirmar conta",
      "codigo",
    ],
    answer:
      "Se nao recebeste o e-mail: 1) Verifica spam. 2) Confirma o e-mail no perfil. 3) Pede novo codigo. 4) Após 10 min, escreve a soporte@agromarket.co.",
  },
  {
    id: "currency",
    keywords: [
      "moeda",
      "divisa",
      "dolar",
      "euro",
      "cop",
      "usd",
      "precio em",
      "nao muda",
    ],
    answer:
      "Abre o seletor de moeda no topo (ex. COP) e escolhe USD, EUR, BRL, MXN, CLP, PEN, ARS, CAD, JPY ou CNY. Todo se recalcula na hora.",
  },
  {
    id: "language",
    keywords: ["idioma", "lingua", "ingles", "espanol", "traducao", "nao muda"],
    answer:
      "Abre o seletor de idioma (ES) no topo e escolhe entre os 7 idiomas. Todo o projeto se traduze na hora.",
  },
  {
    id: "payment",
    keywords: [
      "pagamento",
      "pagar",
      "pse",
      "cartao",
      "nequi",
      "rejeitado",
      "factura",
    ],
    answer:
      "Aceptamos PSE, Visa/Mastercard, Nequi, Daviplata e Mercado Pago. Verifica saldo e dados, prova PSE e revisa Meus pedidos.",
  },
  {
    id: "order",
    keywords: ["pedido", "nao aparece", "rastrear", "estado"],
    answer:
      "Vai a Meus pedidos para estado e rastreo. Confirma o pagamento, recarga e filtra por data. Envio 24-48 h.",
  },
  {
    id: "cart",
    keywords: ["carrinho", "adicionar", "quantidade", "estoque"],
    answer:
      "Abre o produto, escolhe kg e toca Adicionar. Verifica estoque e faz login.",
  },
  {
    id: "sell",
    keywords: ["vender", "produtor", "publicar", "fazenda"],
    answer:
      "Registra-te como Produtor, completa a fazenda e publica com preço por kg. Ajuda: +57 312 765 8412.",
  },
  {
    id: "shipping",
    keywords: ["entrega", "envio", "endereco", "atraso"],
    answer:
      "Custo no checkout, prazo 24-48 h. Verifica endereço completo no perfil e passo 2.",
  },
  {
    id: "returns",
    keywords: ["devolucion", "reembolso", "danificado", "foto"],
    answer:
      "Tira fotos em 12 h e reporta em Reportar problema ou WhatsApp +57 312 765 8412.",
  },
  {
    id: "help",
    keywords: ["ajuda", "suporte", "whatsapp", "contacto"],
    answer: "Suporte WhatsApp 24/7: +57 312 765 8412 ou soporte@agromarket.co.",
  },
];

// FR
const fr = [
  {
    id: "login",
    keywords: [
      "connexion",
      "connecter",
      "mot de passe",
      "je ne peux pas me connecter",
      "compte bloque",
    ],
    answer:
      "Pour vous connecter: 1) Allez à Connexion. 2) Entrez e-mail et mot de passe. 3) Mot de passe oublié. Compte bloqué: attendez 15 min ou écrivez à soporte@agromarket.co.",
  },
  {
    id: "email",
    keywords: ["e-mail", "email", "verification", "pas recu", "spam", "code"],
    answer:
      "Pas reçu? 1) Vérifiez spam. 2) Adresse dans le profil. 3) Nouveau code depuis Vérifier e-mail. 4) Après 10 min, soporte@agromarket.co.",
  },
  {
    id: "currency",
    keywords: [
      "devise",
      "monnaie",
      "dollar",
      "euro",
      "cop",
      "usd",
      "prix en",
      "ne change pas",
    ],
    answer:
      "Ouvrez le sélecteur de devise en haut (ex. COP) et choisissez USD, EUR, BRL, MXN, CLP, PEN, ARS, CAD, JPY ou CNY. Tout se recalcule instantanément.",
  },
  {
    id: "language",
    keywords: ["langue", "anglais", "espagnol", "traduction", "ne change pas"],
    answer:
      "Ouvrez le sélecteur de langue (ES) en haut et choisissez parmi les 7 langues. Tout se traduit instantanément.",
  },
  {
    id: "payment",
    keywords: [
      "paiement",
      "payer",
      "pse",
      "carte",
      "nequi",
      "refuse",
      "facture",
    ],
    answer:
      "PSE, Visa/Mastercard, Nequi, Daviplata et Mercado Pago. Vérifiez fonds, essayez PSE et vérifiez Mes commandes.",
  },
  {
    id: "order",
    keywords: ["commande", "n'apparait pas", "suivi", "statut"],
    answer:
      "Allez à Mes commandes pour le statut. Confirmez le paiement, rechargez, filtrez. Expédition 24-48 h.",
  },
  {
    id: "cart",
    keywords: ["panier", "ajouter", "quantite", "stock"],
    answer:
      "Ouvrez le produit, choisissez les kg et ajoutez. Vérifiez stock et connectez-vous.",
  },
  {
    id: "sell",
    keywords: ["vendre", "producteur", "publier", "ferme"],
    answer:
      "Inscrivez-vous comme Producteur, complétez la ferme et publiez. Aide: +57 312 765 8412.",
  },
  {
    id: "shipping",
    keywords: ["livraison", "envoi", "adresse", "retard"],
    answer:
      "Coût calculé au checkout, 24-48 h. Vérifiez l'adresse au profil et étape 2.",
  },
  {
    id: "returns",
    keywords: ["retour", "remboursement", "abime", "photo"],
    answer:
      "Photos sous 12 h et Signaler un problème ou WhatsApp +57 312 765 8412.",
  },
  {
    id: "help",
    keywords: ["aide", "support", "whatsapp", "contact"],
    answer: "Support WhatsApp 24/7: +57 312 765 8412 ou soporte@agromarket.co.",
  },
];

// DE
const de = [
  {
    id: "login",
    keywords: [
      "anmelden",
      "login",
      "passwort",
      "kann mich nicht anmelden",
      "konto gesperrt",
    ],
    answer:
      "Zum Anmelden: 1) Gehe zu Login. 2) E-Mail und Passwort eingeben. 3) Passwort vergessen nutzen. Gesperrt: 15 Min warten oder soporte@agromarket.co schreiben.",
  },
  {
    id: "email",
    keywords: [
      "e-mail",
      "email",
      "bestatigung",
      "nicht erhalten",
      "spam",
      "code",
    ],
    answer:
      "Nicht erhalten? 1) Spam prüfen. 2) Adresse im Profil prüfen. 3) Neuen Code anfordern. 4) Nach 10 Min: soporte@agromarket.co.",
  },
  {
    id: "currency",
    keywords: [
      "wahrung",
      "geld",
      "dollar",
      "euro",
      "cop",
      "usd",
      "preis in",
      "andert sich nicht",
    ],
    answer:
      "Währungsauswahl oben öffnen (z. B. COP) und USD, EUR, BRL, MXN, CLP, PEN, ARS, CAD, JPY oder CNY wählen. Alles rechnet sofort um.",
  },
  {
    id: "language",
    keywords: [
      "sprache",
      "englisch",
      "spanisch",
      "ubersetzung",
      "andert sich nicht",
    ],
    answer:
      "Sprachauswahl (ES) oben öffnen und aus den 7 Sprachen wählen. Alles übersetzt sofort.",
  },
  {
    id: "payment",
    keywords: [
      "zahlung",
      "zahlen",
      "pse",
      "karte",
      "nequi",
      "abgelehnt",
      "rechnung",
    ],
    answer:
      "PSE, Visa/Mastercard, Nequi, Daviplata und Mercado Pago. Guthaben prüfen, PSE versuchen, Meine Bestellungen prüfen.",
  },
  {
    id: "order",
    keywords: ["bestellung", "erscheint nicht", "verfolgung", "status"],
    answer:
      "Meine Bestellungen für Status und Tracking. Zahlung prüfen, neu laden, nach Datum filtern. Versand 24-48 h.",
  },
  {
    id: "cart",
    keywords: ["warenkorb", "hinzufugen", "menge", "bestand"],
    answer:
      "Produkt öffnen, kg wählen, Hinzufügen. Bestand prüfen und anmelden.",
  },
  {
    id: "sell",
    keywords: ["verkaufen", "produzent", "veroffentlichen", "farm"],
    answer:
      "Als Produzent registrieren, Farmprofil vervollständigen und veröffentlichen. Hilfe: +57 312 765 8412.",
  },
  {
    id: "shipping",
    keywords: ["versand", "lieferung", "adresse", "verspatung"],
    answer:
      "Kosten im Checkout, Lieferzeit 24-48 h. Adresse im Profil und Schritt 2 prüfen.",
  },
  {
    id: "returns",
    keywords: ["ruckgabe", "erstattung", "beschadigt", "foto"],
    answer: "Fotos in 12 h und Problem melden oder WhatsApp +57 312 765 8412.",
  },
  {
    id: "help",
    keywords: ["hilfe", "support", "whatsapp", "kontakt"],
    answer:
      "Support WhatsApp 24/7: +57 312 765 8412 oder soporte@agromarket.co.",
  },
];

// ZH
const zh = [
  {
    id: "login",
    keywords: ["登录", "密码", "无法登录", "账户锁定"],
    answer:
      "登录方法：前往“登录”，输入邮箱和密码，或使用“忘记密码”。账户锁定请等待15分钟或联系 soporte@agromarket.co。",
  },
  {
    id: "email",
    keywords: ["邮件", "验证", "没收到", "垃圾邮件", "验证码"],
    answer:
      "未收到邮件？1) 检查垃圾邮件。2) 确认邮箱拼写。3) 重新发送验证码。4) 10分钟后联系 soporte@agromarket.co。",
  },
  {
    id: "currency",
    keywords: ["货币", "币种", "美元", "欧元", "价格", "不变化"],
    answer:
      "点击顶部货币选择器（如 COP），选择 USD、EUR、BRL、MXN、CLP、PEN、ARS、CAD、JPY 或 CNY。全站即时重新计算。",
  },
  {
    id: "language",
    keywords: ["语言", "英语", "西班牙语", "翻译", "不变"],
    answer: "点击顶部语言选择器（ES），从7种语言中选择。全站即时翻译。",
  },
  {
    id: "payment",
    keywords: ["支付", "付款", "银行卡", "被拒", "发票"],
    answer:
      "支持 PSE、Visa/Mastercard、Nequi、Daviplata 和 Mercado Pago。检查余额、尝试 PSE 并查看“我的订单”。",
  },
  {
    id: "order",
    keywords: ["订单", "不显示", "跟踪", "状态"],
    answer:
      "前往“我的订单”查看状态和跟踪。确认支付、刷新、按日期筛选。发货24-48小时。",
  },
  {
    id: "cart",
    keywords: ["购物车", "添加", "数量", "库存"],
    answer: "打开商品选择公斤数并点击添加。检查库存并登录。",
  },
  {
    id: "sell",
    keywords: ["卖", "销售", "生产者", "农场"],
    answer: "注册为生产者、完善农场资料并发布。帮助：+57 312 765 8412。",
  },
  {
    id: "shipping",
    keywords: ["配送", "发货", "地址", "延迟"],
    answer: "结算时计算费用，时效24-48小时。检查资料和第2步的地址。",
  },
  {
    id: "returns",
    keywords: ["退货", "退款", "损坏", "照片"],
    answer: "12小时内拍照，报告问题或 WhatsApp +57 312 765 8412。",
  },
  {
    id: "help",
    keywords: ["帮助", "支持", "联系", "电话"],
    answer: "客服 WhatsApp 24/7：+57 312 765 8412 或 soporte@agromarket.co。",
  },
];

// AR
const ar = [
  {
    id: "login",
    keywords: [
      "تسجيل الدخول",
      "دخول",
      "كلمة المرور",
      "لا استطيع الدخول",
      "مقفل",
    ],
    answer:
      "لتسجيل الدخول: اذهب إلى الدخول وأدخل البريد وكلمة المرور أو استخدم نسيت كلمة المرور. إذا كان مقفلاً انتظر 15 دقيقة أو راسل soporte@agromarket.co.",
  },
  {
    id: "email",
    keywords: ["بريد", "تحقق", "لم يصلني", "سبام", "رمز"],
    answer:
      "لم يصلك؟ تحقق من Spam، تأكد من البريد في الملف، اطلب رمزاً جديداً، بعد 10 دقائق راسل soporte@agromarket.co.",
  },
  {
    id: "currency",
    keywords: ["عملة", "دولار", "يورو", "السعر", "لا تتغير"],
    answer:
      "افتح محدد العملة في الأعلى (مثل COP) واختر USD أو EUR أو BRL أو MXN أو CLP أو PEN أو ARS أو CAD أو JPY أو CNY. كل شيء يحدّث فوراً.",
  },
  {
    id: "language",
    keywords: ["لغة", "انجليزية", "اسبانيا", "ترجمة", "لا تتغير"],
    answer:
      "افتح محدد اللغة (ES) في الأعلى واختر من بين 7 لغات. كل المشروع يترجم فوراً.",
  },
  {
    id: "payment",
    keywords: ["دفع", "بطاقة", "مرفوض", "فاتورة"],
    answer:
      "نقبل PSE وVisa/Mastercard وNequi وDaviplata وMercado Pago. تحقق من الرصيد وجرب PSE وراجع طلباتي.",
  },
  {
    id: "order",
    keywords: ["طلب", "لا يظهر", "تتبع", "حالة"],
    answer:
      "اذهب إلى طلباتي للحالة والتتبع. أكد الدفع وحدّث الصفحة ورشّح بالتاريخ. الشحن 24-48 ساعة.",
  },
  {
    id: "cart",
    keywords: ["سلة", "اضافة", "كمية", "مخزون"],
    answer:
      "افتح المنتج واختر الكيلو واضغط إضافة. تحقق من المخزون وسجّل الدخول.",
  },
  {
    id: "sell",
    keywords: ["بيع", "منتج", "نشر", "مزرعة"],
    answer: "سجّل كمنتج وأكمل المزرعة وانشر بالسعر. مساعدة: +57 312 765 8412.",
  },
  {
    id: "shipping",
    keywords: ["شحن", "توصيل", "عنوان", "تاخير"],
    answer:
      "تُحسب التكلفة في الدفع والتسليم 24-48 ساعة. تحقق من العنوان في الملف والخطوة 2.",
  },
  {
    id: "returns",
    keywords: ["ارجاع", "استرداد", "تالف", "صورة"],
    answer:
      "التقط صوراً خلال 12 ساعة وأبلغ عبر الإبلاغ عن مشكلة أو واتساب +57 312 765 8412.",
  },
  {
    id: "help",
    keywords: ["مساعدة", "دعم", "واتساب", "اتصال"],
    answer: "الدعم واتساب 24/7: +57 312 765 8412 أو soporte@agromarket.co.",
  },
];

const knowledgeBase = { es, en, pt, fr, de, zh, ar };

export default knowledgeBase;
