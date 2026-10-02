const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "frontend", "src");

/* Textos nuevos que hay que anadir a todos los idiomas. Si anaden una clave en
   un componente y seolvidan de los otros 6 idiomas, i18next no avisa: devuelve
   la clave cruda o el espanol y el usuario ve "ayuda.reportInstead". Este
   script es el que se encarga de que eso no pase por olvido. */
const NUEVAS = {
  "footer.contactSupport": {
    es: "Contactar soporte",
    en: "Contact support",
    pt: "Falar com o suporte",
    fr: "Contacter le support",
    de: "Support kontaktieren",
    zh: "联系客服",
    ar: "اتصل بالدعم",
  },
  "ayuda.reportInstead": {
    es: "Enviar un reporte de problema",
    en: "Send a problem report",
    pt: "Enviar um relato de problema",
    fr: "Envoyer un signalement de problème",
    de: "Problembericht senden",
    zh: "提交问题报告",
    ar: "إرسال بلاغ عن مشكلة",
  },
};

const idiomaDe = (f) => path.basename(f, ".json");

function deepest(obj) {
  let out = obj;
  while (out && typeof out === "object" && !Array.isArray(out)) {
    const vals = Object.values(out);
    if (vals.length && vals.every((v) => v && typeof v === "object")) out = vals[0];
    else break;
  }
  return out;
}

let anadidas = 0;
for (const archivo of fs.readdirSync(path.join(SRC, "i18n", "locales"))) {
  if (!archivo.endsWith(".json")) continue;
  const idioma = idiomaDe(archivo);
  const completa = path.join(SRC, "i18n", "locales", archivo);
  const json = JSON.parse(fs.readFileSync(completa, "utf8"));

  for (const [clave, valores] of Object.entries(NUEVAS)) {
    const texto = valores[idioma];
    if (!texto) {
      console.log("  FALTA la traduccion de " + clave + " en " + idioma);
      continue;
    }
    const partes = clave.split(".");
    let nodo = json;
    for (const p of partes.slice(0, -1)) {
      if (!nodo[p] || typeof nodo[p] !== "object") nodo[p] = {};
      nodo = nodo[p];
    }
    const ultima = partes[partes.length - 1];
    if (nodo[ultima] === texto) continue;
    nodo[ultima] = texto;
    anadidas++;
    console.log("  + " + clave + "  (" + idioma + ")");
  }

  fs.writeFileSync(completa, JSON.stringify(json, null, 2) + "\n", "utf8");
}

console.log("");
console.log("  " + anadidas + " textos anadidos o actualizados.");