/**
 * Contenido legal de AgroMarket.
 *
 * Los textos que estaban en i18n eran genéricos ("utilizamos cookies para
 * mejorar tu experiencia") y no citaban ninguna norma, no nombraban al
 * responsable del tratamiento, no describían los derechos ARCO ni las
 * transferencias internacionales. Con eso la plataforma queda expuesta a
 * sanciones de la SIC en Colombia y fuera de ella.
 *
 * Base normativa utilizada:
 *  - Ley 1581 de 2012 y Decreto 1377 de 2013 (Colombia, Habeas Data)
 *  - Ley 1712 de 2014 (Ley de Transparencia, Colombia)
 *  - Ley 1480 de 2011 (Estatuto del Consumidor, Colombia)
 *  - Reglamento (UE) 2016/679 - RGPD (Unión Europea)
 *  - Ley 19.628 sobre Protección de Datos Personales (Uruguay)
 *  - Ley 25.326 de Protección de Datos Personales (Argentina)
 *
 * AVISO IMPORTANTE: estos textos son una base técnica sólida, pero un abogado
 * debe revisarlos antes de publicarse en producción. Antes de eso hay que
 * sustituir los marcadores NIT, DOMICILIO, EMAIL_PRIVACIDAD y TELEFONO por
 * los datos reales del responsable del tratamiento.
 */

const EMPRESA = {
  nombre: "AgroMarket ASAFRUT",
  nit: "NIT PENDIENTE",
  domicilio: "DOMICILIO PENDIENTE",
  correo: "privacidad@agro-market.app",
  telefono: "TELÉFONO PENDIENTE",
  pais: "Colombia",
};

/** Datos de contacto del responsable, usados por todos los documentos. */
export const DATOS_RESPONSABLE = EMPRESA;

/** Documentos legales disponibles. La clave coincide con la ruta pública. */
export const DOCUMENTOS_LEGALES = {
  terminos: {
    ruta: "/terminos",
    titulo: "Términos y Condiciones",
    resumen:
      "Uso de la plataforma, condiciones de compra, pago, entrega, devoluciones y solución de controversias.",
    alcance: ["Colombia", "Latinoamérica"],
    actualizado: "28 de septiembre de 2026",
    secciones: [
      {
        titulo: "1. Identidad del operador",
        parrafos: [
          `${EMPRESA.nombre} (en adelante "AgroMarket" o "la Plataforma") opera el marketplace agrícola del dominio agro-market.app. Conecta productores de la región de Urabá, Antioquia (Colombia) con compradores personas naturales y jurídicas.`,
          `Identificación: ${EMPRESA.nit}. Domicilio: ${EMPRESA.domicilio}, ${EMPRESA.pais}. Correo: ${EMPRESA.correo}. Teléfono: ${EMPRESA.telefono}.`,
          "AgroMarket no es el productor directo de los bienes. Cada producto es comercializado por el productor registrado que figura en su ficha, quien responde por la calidad, el peso y la información del producto. AgroMarket actúa como intermediario tecnológico.",
        ],
      },
      {
        titulo: "2. Objeto y aceptación",
        parrafos: [
          "Estos términos regulan el acceso y uso de la Plataforma por usuarios compradores y productores. El registro o uso implica la aceptación expresa de la versión vigente.",
          "AgroMarket puede modificar estos términos; los cambios se publicarán en esta página con su fecha de actualización y se notificarán a los usuarios registrados por correo o por notificación en la plataforma.",
        ],
      },
      {
        titulo: "3. Registro y cuentas",
        parrafos: [
          "Comprar o vender exige una cuenta con información veraz y actualizada. El usuario responde por la confidencialidad de sus credenciales, contraseñas y códigos de verificación en dos pasos.",
          "Para verificar la calidad de productor, AgroMarket puede solicitar documento de identidad, RUT o NIT y constancia de la finca. Esa información se trata conforme a la Política de Privacidad.",
          "Cada usuario responde por las actividades en su cuenta. Los menores de 18 años necesitan autorización de su representante legal. AgroMarket puede suspender cuentas con información falsa, uso fraudulento o conducta que perjudique a otros usuarios.",
        ],
      },
      {
        titulo: "4. Compra y pago",
        parrafos: [
          "Los precios incluyen el IVA vigente en Colombia y se expresan en pesos colombianos (COP). AgroMarket no cobra cargos adicionales de gestión ni por la pasarela de pago.",
          "El pago se realiza mediante Mercado Pago, que admite tarjeta de crédito, tarjeta débito y PSE. AgroMarket no almacena números de tarjeta: los datos viajan directamente a la pasarela mediante un token de un solo uso.",
          "La orden de compra se perfecciona cuando la pasarela aprueba el pago y AgroMarket confirma la recepción del pedido. Si la pasarela rechaza la transacción, no nace ninguna obligación de pago.",
        ],
      },
      {
        titulo: "5. Envío: cálculo por distancia",
        parrafos: [
          "AgroMarket no aplica una tarifa fija de envío. El costo se calcula según la distancia real entre el centro de acopio de origen (Chigorodó, Urabá, Antioquia) y el municipio de destino.",
          "El comprador ve el valor, la zona logística y el plazo estimado antes de confirmar el pago. El cálculo se basa en la fórmula de Haversine, disponible en el proceso de compra para su consulta.",
          "Los plazos son estimados y dependen de la zona, la disponibilidad del transportador y el clima de la región. Si un producto no está disponible tras confirmar el pedido, se avisa al comprador y se ofrece un equivalente o la cancelación con reembolso total, incluida la tarifa de envío si esta no se ejecutó.",
        ],
      },
      {
        titulo: "6. Entrega y transferencia del riesgo",
        parrafos: [
          "El bien se entiende entregado cuando se pone a disposición del transportador en el centro de acopio de origen, salvo pacto distinto. El riesgo de pérdida o deterioro pasa al comprador en ese momento.",
          "El comprador debe recibir la mercancía en la dirección registrada y verificar su estado. AgroMarket exige fotografías del producto al momento de la entrega para activar una devolución.",
        ],
      },
      {
        titulo: "7. Derechos del consumidor y retracto",
        parrafos: [
          "El comprador tiene los derechos del Estatuto del Consumidor (Ley 1480 de 2011): información veraz, facturación, accesibilidad, retracto y garantía.",
          `El retracto se puede ejercer dentro de los cinco (5) días hábiles siguientes a la entrega, escribiendo a ${EMPRESA.correo}, siempre que el producto no haya sido abierto ni usado y conserve su estado original. Si la causa es imputable al productor, AgroMarket asume el costo del retorno.`,
          "La garantía legal cubre defectos de inocuidad, productos no aptos para consumo o diferencias con la descripción publicada. Los productos con garantía del fabricante se rigen además por las condiciones de este.",
        ],
      },
      {
        titulo: "8. Propiedad intelectual",
        parrafos: [
          "La marca AgroMarket, su logotipo, el diseño de la interfaz y el software son propiedad de AgroMarket o de sus licenciantes. Se prohíbe su reproducción o explotación sin autorización escrita.",
          "Los productores conservan la titularidad de las fotografías de sus productos. AgroMarket las usa solo para operar la plataforma.",
        ],
      },
      {
        titulo: "9. Uso aceptable",
        parrafos: [
          "Está prohibido publicar productos prohibidos, documentos falsos, realizar operaciones engañosas o causar denegación de servicio.",
          "También se prohíbe el uso de sistemas automatizados para extraer masivamente el catálogo o los datos de usuarios, así como la ingeniería inversa de la plataforma.",
        ],
      },
      {
        titulo: "10. Responsabilidad",
        parrafos: [
          "AgroMarket responde por los defectos que afecten al título o la identidad del producto y por el incumplimiento de estas obligaciones. No responde por daños indirectos, lucro cesante o pérdida de oportunidades derivados de la indisponibilidad del servicio.",
          "La responsabilidad total por cualquier reclamación relacionada con un pedido se limita al valor del producto y del envío de ese pedido.",
        ],
      },
      {
        titulo: "11. Suspensión y eliminación de cuenta",
        parrafos: [
          "AgroMarket puede suspender o terminar la relación ante incumplimiento, fraude, falsificación de datos o reincidencia.",
          `El usuario puede pedir la eliminación de su cuenta escribiendo a ${EMPRESA.correo}. Eliminar el perfil no impide conservar los datos que la ley exige retener, como registros contables y fiscales, por los plazos legales de conservación.`,
        ],
      },
      {
        titulo: "12. Ley aplicable y controversias",
        parrafos: [
          "Estos términos se rigen por las leyes de la República de Colombia, en particular la Ley 1480 de 2011, la Ley 1581 de 2012 y la Ley 1712 de 2014.",
          "Las partes procurarán resolver de forma directa cualquier controversia. Si no es posible, el usuario podrá acudir a la Superintendencia de Industria y Comercio (SIC), a la Dirección de Asesoría Jurídica de la Superintendencia de Sociedades o a la autoridad de protección de datos de su país de residencia.",
          "Para usuarios fuera de Colombia se reconoce la protección de datos de la legislación aplicable, incluido el Reglamento (UE) 2016/679 (RGPD) y las leyes de protección de datos de su jurisdicción.",
        ],
      },
    ],
  },

  privacidad: {
    ruta: "/privacidad",
    titulo: "Política de Privacidad y Tratamiento de Datos Personales",
    resumen:
      "Qué datos tratamos, con qué finalidad, cómo los protegemos y cómo ejercer tus derechos como titular.",
    alcance: ["Colombia", "Unión Europea", "Latinoamérica", "Global"],
    actualizado: "28 de septiembre de 2026",
    secciones: [
      {
        titulo: "1. Responsable del tratamiento",
        parrafos: [
          `${EMPRESA.nombre} es responsable del tratamiento de los datos personales que se recopilan a través de agro-market.app. Datos de contacto: ${EMPRESA.nit}, ${EMPRESA.domicilio}, ${EMPRESA.pais}. Correo para asuntos de privacidad: ${EMPRESA.correo}. Teléfono: ${EMPRESA.telefono}.`,
          "Esta política se aplica conforme a la Ley 1581 de 2012 y su Decreto reglamentario 1377 de 2013 en Colombia, al Reglamento (UE) 2016/679 (RGPD) para títulos en el Espacio Económico Europeo, y a las leyes de protección de datos de Argentina (Ley 25.326) y Uruguay (Ley 19.628).",
        ],
      },
      {
        titulo: "2. Qué datos tratamos",
        parrafos: [
          "Datos que usted nos entrega: nombre, correo electrónico, teléfono, documento de identidad para verificar productores, RUT o NIT y dirección de entrega.",
          "Datos generados por el uso: historial de pedidos, productos vistos, lista de deseos, mensajes con productores, reseñas, direcciones guardadas y preferencias de notificación.",
          "Datos técnicos: dirección IP, tipo de navegador y sistema operativo, páginas visitadas y registros de acceso a la cuenta. La plataforma usa verificación en dos pasos y registra eventos de acceso por seguridad.",
        ],
      },
      {
        titulo: "3. Con qué finalidad tratamos los datos",
        parrafos: [
          "Finalidades principales: crear y mantener su cuenta; procesar pedidos, pagos, envíos y devoluciones; verificar productores; comunicar el estado de pedidos y envíos; y prestar soporte.",
          "Finalidades adicionales, sujetas a su autorización previa: comunicaciones comerciales, newsletters y promociones. Puede retirar ese consentimiento en cualquier momento.",
          "El tratamiento con fines de mercadeo no es necesario para ejecutar el contrato de compra y se fundamenta en su consentimiento previo, expreso y revocable.",
        ],
      },
      {
        titulo: "4. Fundamento legal del tratamiento",
        parrafos: [
          "En Colombia, el tratamiento se fundamenta en su consentimiento, en la ejecución de la relación contractual y en el cumplimiento de obligaciones legales (Ley 1581 de 2012, artículos 10 y 11).",
          "En el Espacio Económico Europeo se aplican los artículos 6.1.b) (ejecución del contrato), 6.1.a) (consentimiento) y 6.1.c) (cumplimiento de obligación legal) del RGPD.",
        ],
      },
      {
        titulo: "5. Plazo de conservación",
        parrafos: [
          "Los datos de cuenta se conservan mientras la cuenta esté activa. Tras la eliminación, los datos personales se eliminan o anonimizan.",
          "Los datos asociados a facturas, pagos y movimientos contables se conservan por los plazos legales de conservación fiscal y contable en Colombia, aunque la cuenta se cierre. Los registros de acceso y seguridad se conservan el tiempo necesario para investigar incidentes.",
        ],
      },
      {
        titulo: "6. Tus derechos como titular (derechos ARCO)",
        parrafos: [
          `Tiene derecho a conocer sus datos (Acceso), solicitar su corrección (Rectificación), solicitar su supresión (Cancelación) y oponerse al tratamiento (Oposición). Puede ejercerlos escribiendo a ${EMPRESA.correo} con su nombre, el correo de registro y una descripción clara de la solicitud.`,
          "AgroMarket responderá dentro de los plazos previstos por la Ley 1581 de 2012 y el Decreto 1377 de 2013. La autoridad de control en Colombia es la Superintendencia de Industria y Comercio (SIC).",
        ],
      },
      {
        titulo: "7. Seguridad de la información",
        parrafos: [
          "Aplicamos medidas técnicas y administrativas: cifrado del tránsito mediante HTTPS, verificación en dos pasos, control de acceso por rol y auditoría de accesos administrativos.",
          "Los datos de tarjetas de pago no se almacenan en nuestros servidores: se procesan directamente en la pasarela certificada Mercado Pago. Ningún empleado de AgroMarket accede a números completos de tarjeta.",
        ],
      },
      {
        titulo: "8. Transferencias internacionales",
        parrafos: [
          "AgroMarket utiliza proveedores de servicios en la nube y pasarelas de pago ubicados fuera de Colombia. Cuando sus datos se transfieren al exterior se aplican cláusulas contractuales tipo y salvaguardas para garantizar un nivel adecuado de protección, conforme al artículo 49 del RGPD y al régimen colombiano de circulación internacional de datos.",
          `Puede solicitar información sobre los destinatarios de las transferencias escribiendo a ${EMPRESA.correo}.`,
        ],
      },
      {
        titulo: "9. Menores de edad",
        parrafos: [
          "La Plataforma está dirigida a mayores de 18 años. No recopilamos de forma intencional datos de menores. Si detectamos el registro de un menor, eliminaremos su cuenta y sus datos.",
        ],
      },
      {
        titulo: "10. Cambios a esta política",
        parrafos: [
          "Podemos actualizar esta política. Los cambios sustanciales se anunciarán en la plataforma y, cuando afecten de forma relevante sus derechos, se notificarán por correo electrónico.",
        ],
      },
    ],
  },

  cookies: {
    ruta: "/cookies",
    titulo: "Política de Cookies",
    resumen:
      "Qué cookies usa AgroMarket, para qué, cuánto duran y cómo gestionarlas o retirarlas.",
    alcance: ["Global"],
    actualizado: "28 de septiembre de 2026",
    secciones: [
      {
        titulo: "1. Qué son las cookies",
        parrafos: [
          "Las cookies son archivos que el navegador guarda en su equipo. Hay dos tipos: las de sesión, que se eliminan al cerrar el navegador, y las persistentes, que permanecen hasta su fecha de caducidad o hasta que usted las borra.",
          "AgroMarket no utiliza tecnologías de rastreo publicitario de terceros ni cookies que perfilen su navegación con fines ajenos al marketplace.",
        ],
      },
      {
        titulo: "2. Cookies que usamos",
        parrafos: [
          "Esenciales (sin consentimiento): identifican su sesión iniciada, mantienen la seguridad de la cuenta, recuerdan el consentimiento que ya dio a las cookies opcionales y son compatibles con la verificación en dos pasos. Sin ellas la plataforma no funciona.",
          "Funcionales (requieren consentimiento): recuerdan sus preferencias de idioma y moneda para no preguntarlas en cada visita.",
          "Analíticas (requieren consentimiento): permiten medir de forma agregada cómo se usa la plataforma para mejorarla. No permiten identificarlo personalmente.",
        ],
      },
      {
        titulo: "3. Gestión del consentimiento",
        parrafos: [
          "Puede aceptar, rechazar o configurar sus preferencias desde el aviso de cookies de su primera visita. Su elección queda registrada y puede cambiarla en cualquier momento borrando el dato de consentimiento desde las opciones del navegador y recargando la página.",
          "Rechazar las cookies opcionales no impide usar la plataforma: solo desactiva el recuerdo de idioma y divisa, y la medición de uso.",
        ],
      },
      {
        titulo: "4. Cómo borrar cookies desde su navegador",
        parrafos: [
          "Puede eliminar o bloquear cookies en la configuración del navegador. Si bloquea las cookies esenciales no podrá iniciar sesión ni completar una compra.",
          "Chrome y Edge: Configuración > Privacidad y seguridad > Cookies y otros datos de sitios > Ver todos los datos de sitios y eliminar. Firefox: Privacidad y seguridad > Cookies y datos de sitios. Safari: Preferencias > Privacidad > Gestionar datos de sitios web.",
        ],
      },
      {
        titulo: "5. Cookies de terceros",
        parrafos: [
          "La pasarela Mercado Pago puede establecer cookies propias durante el pago. Se rigen por la política de privacidad de Mercado Pago, no por esta. AgroMarket no controla ni accede a ellas.",
        ],
      },
    ],
  },
};
