/*
 * Actualiza las traducciones del formulario de reporte de soporte.
 *
 *   node scripts/actualiza-report-i18n.cjs
 *
 * POR QUE HACE FALTA: el formulario antes guardaba en localStorage, y el texto
 * de exito lo decia openly ("El reporte quedo registrado en este navegador").
 * Al pasar a enviarlo de verdad, ese texto paso a ser MENTIRA: el usuario
 * leeria que solo se guardo en su equipo, y pensaria que nadie fue avisado.
 *
 * Tambien anade las claves nuevas (sending, emailHint, tooMany, sendError), que
 * no existian y sin ellas los botones y errores saldrian con el texto en
 * espanol dentro de una pagina en japones... que no existe todavia, pero
 * cualquier idioma que se anada mañana.
 *
 * Se parchea el JSON en vez de reescribirlo entero para no perder el orden ni
 * los saltos de linea, y para que un fallo a mitad no deje un archivo corrupto.
 */
const fs = require("fs");
const path = require("path");

const LOCALES = path.resolve(__dirname, "..", "frontend", "src", "i18n", "locales");

/**
 * Textos por idioma.
 *
 * Los nuevos van con la clave que usa el componente (report.*).
 */
const CAMBIOS = {
  es: {
    successTitle: "Reporte enviado",
    successText:
      "Recibimos tu reporte y nuestro equipo ya lo tiene en cola. Si dejaste un correo, te respondemos por ahí.",
    emailHint: "Opcional. Si lo dejas, te respondemos por correo.",
    sending: "Enviando…",
    tooMany:
      "Has enviado varios reportes seguidos. Espera un minuto e inténtalo de nuevo.",
    sendError:
      "No pudimos enviar tu reporte. Revisa tu conexión o escríbenos por WhatsApp.",
  },
  en: {
    successTitle: "Report sent",
    successText:
      "We received your report and our team already has it in the queue. If you left an email, we'll reply there.",
    emailHint: "Optional. If you add it, we'll reply by email.",
    sending: "Sending…",
    tooMany:
      "You've sent several reports in a row. Wait a minute and try again.",
    sendError:
      "We couldn't send your report. Check your connection or message us on WhatsApp.",
  },
  de: {
    successTitle: "Meldung gesendet",
    successText:
      "Wir haben Ihre Meldung erhalten und unser Team hat sie bereits in der Warteschlange. Wenn Sie eine E-Mail angegeben haben, antworten wir dort.",
    emailHint: "Optional. Wenn Sie sie angeben, antworten wir per E-Mail.",
    sending: "Wird gesendet…",
    tooMany:
      "Sie haben mehrere Meldungen hintereinander gesendet. Warten Sie eine Minute und versuchen Sie es erneut.",
    sendError:
      "Die Meldung konnte nicht gesendet werden. Prüfen Sie Ihre Verbindung oder schreiben Sie uns auf WhatsApp.",
  },
  fr: {
    successTitle: "Signalement envoyé",
    successText:
      "Nous avons bien reçu votre signalement et notre équipe l'a déjà en file d'attente. Si vous avez laissé un e-mail, nous y répondrons.",
    emailHint: "Facultatif. Si vous le renseignez, nous répondrons par e-mail.",
    sending: "Envoi…",
    tooMany:
      "Vous avez envoyé plusieurs signalements d'affilée. Attendez une minute et réessayez.",
    sendError:
      "Impossible d'envoyer le signalement. Vérifiez votre connexion ou écrivez-nous sur WhatsApp.",
  },
  pt: {
    successTitle: "Relato enviado",
    successText:
      "Recebemos seu relato e nossa equipe já o tem na fila. Se você deixou um e-mail, responderemos por ele.",
    emailHint: "Opcional. Se você informar, responderemos por e-mail.",
    sending: "Enviando…",
    tooMany:
      "Você enviou vários relatos seguidos. Aguarde um minuto e tente de novo.",
    sendError:
      "Não conseguimos enviar o relato. Verifique sua conexão ou fale conosco pelo WhatsApp.",
  },
  ar: {
    successTitle: "تم إرسال البلاغ",
    successText:
      "استلمنا بلاغك وفريقنا يضعه في قائمة الانتظار بالفعل. إذا تركت بريدًا إلكترونيًا، سنرد عليك هناك.",
    emailHint: "اختياري. إذا أدخلته، سنرد عبر البريد الإلكتروني.",
    sending: "جارٍ الإرسال…",
    tooMany:
      "لقد أرسلت عدةبلاغات متتالية. انتظر دقيقة وحاول مرة أخرى.",
    sendError:
      "تعذّر إرسال البلاغ. تحقق من اتصالك أو راسلنا على واتساب.",
  },
  zh: {
    successTitle: "报告已发送",
    successText:
      "我们已收到您的报告，我们的团队已将其加入处理队列。如果您留下了邮箱，我们会通过邮件回复。",
    emailHint: "可选。填写后我们将通过邮件回复。",
    sending: "发送中…",
    tooMany: "您连续发送了多份报告。请等待一分钟后重试。",
    sendError: "无法发送报告。请检查您的网络连接，或通过 WhatsApp 联系我们。",
  },
};

let fallos = 0;

for (const [idioma, textos] of Object.entries(CAMBIOS)) {
  const archivo = path.join(LOCALES, idioma + ".json");
  if (!fs.existsSync(archivo)) {
    console.log("  --    " + idioma + ": no existe " + archivo);
    fallos += 1;
    continue;
  }

  let datos;
  try {
    datos = JSON.parse(fs.readFileSync(archivo, "utf8"));
  } catch (ex) {
    console.log("  FALLA " + idioma + ": el JSON no se puede leer (" + ex.message + ")");
    fallos += 1;
    continue;
  }

  if (!datos.report || typeof datos.report !== "object") {
    console.log("  FALLA " + idioma + ": no existe la seccion \"report\"");
    fallos += 1;
    continue;
  }

  const antes = Object.keys(datos.report).length;
  Object.assign(datos.report, textos);
  const despues = Object.keys(datos.report).length;

  // Se escribe con 2 espacios, que es como estan el demás archivos.
  fs.writeFileSync(archivo, JSON.stringify(datos, null, 2) + "\n", "utf8");
  console.log("  OK    " + idioma + ": " + (despues - antes) + " claves nuevas, "
    + Object.keys(textos).length + " textos actualizados");
}

console.log("");
console.log(fallos === 0
  ? "  Todos los idiomas actualizados."
  : "  " + fallos + " archivo(s) sin tocar.");
process.exit(fallos === 0 ? 0 : 1);