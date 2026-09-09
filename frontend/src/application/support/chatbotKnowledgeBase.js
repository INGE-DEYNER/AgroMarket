// ES
const es = [
  { id: "login", keywords: ["iniciar sesion", "login", "entrar", "contrasena", "password", "cuenta bloqueada", "no puedo entrar"], answer: "Para iniciar sesion: 1) Ve a Entrar. 2) Escribe correo y contrasena. 3) Usa Olvidaste tu contrasena si la olvidaste. Si esta bloqueada espera 15 min o escribe a soporte@agromarket.co." },
  { id: "email", keywords: ["correo", "email", "verificacion", "no recibi", "no me llega", "spam", "confirmar cuenta"], answer: "Si no recibiste el correo: 1) Revisa spam/promociones. 2) Verifica el correo en tu perfil. 3) Reenvia el codigo desde Verificar correo. 4) Si pasan 10 min escribe a soporte@agromarket.co." },
  { id: "currency", keywords: ["divisa", "moneda", "dolar", "euro", "cop", "usd", "precio en", "cambia la divisa", "currency"], answer: "Para cambiar la divisa abre el selector de divisa en la barra superior (ej. COP) y elige USD, EUR, BRL, MXN, CLP, PEN, ARS, CAD, JPY o CNY. Todo (home, catalogo, detalle, carrito y checkout) se recalcula al instante." },
  { id: "language", keywords: ["idioma", "lenguaje", "ingles", "portugues", "frances", "language", "no cambia el idioma", "traduccion"], answer: "Para cambiar el idioma abre el selector (ES) en la barra superior y elige entre los 7 idiomas. Todo el proyecto se traduce al instante, incluyendo ayuda y legales." },
  { id: "payment", keywords: ["pago", "pagar", "pse", "tarjeta", "nequi", "daviplata", "mercado pago", "rechaz", "factura", "payment"], answer: "Aceptamos PSE, tarjeta Visa/Mastercard, Nequi, Daviplata y Mercado Pago. Si fue rechazado: verifica fondos y datos, intenta PSE u otro metodo y revisa Mis pedidos antes de reintentar." },
  { id: "order", keywords: ["pedido", "orden", "no aparece", "seguimiento", "rastrear", "estado del pedido", "order"], answer: "Ve a Mis pedidos para estado y seguimiento. Si no aparece: confirma el pago, recarga y filtra por fecha. El despacho tarda 24-48 h para mantener frescura." },
  { id: "cart", keywords: ["carrito", "agregar", "anadir", "cantidad", "vaciar", "no puedo agregar", "cart", "stock"], answer: "Abre el producto, elige la cantidad en kg y pulsa Agregar. Abre el carrito para ajustar cantidades. Verifica stock e inicia sesion antes del pago." },
  { id: "sell", keywords: ["vender", "productor", "publicar", "finca", "cosecha", "sell", "quiero vender"], answer: "Para vender: 1) Registrate como Productor. 2) Completa tu perfil y finca. 3) Publica productos con precio por kg y stock. 4) Gestiona pedidos. Ayuda ASAFRUT: +57 300 123 4567." },
  { id: "shipping", keywords: ["envio", "entrega", "despacho", "demora", "direccion", "shipping"], answer: "El costo de envio se calcula en el checkout y el plazo es 24-48 h. Verifica direccion completa (departamento, ciudad, direccion y referencias) en tu perfil y paso 2 del checkout." },
  { id: "returns", keywords: ["devolucion", "reembolso", "danado", "mal estado", "foto", "refund", "return"], answer: "Si llego en mal estado toma fotos dentro de las 12 h y reportalo en Reportar un problema o WhatsApp +57 300 123 4567. Hacemos reposicion o reembolso." },
  { id: "account", keywords: ["cuenta", "perfil", "datos", "telefono", "direccion guardada", "eliminar cuenta", "account"], answer: "Actualiza nombre, telefono, direccion y foto en Mi perfil. Para eliminar o corregir datos personales escribe a privacidad@agro-market.app." },
  { id: "messages", keywords: ["mensaje", "chat", "hablar con", "contactar productor", "mensajeria"], answer: "Usa Mensajes para hablar con productores o soporte. Si un chat no carga, recarga la pagina y verifica tu conexion." },
  { id: "help", keywords: ["ayuda", "soporte", "contacto", "whatsapp", "telefono", "help"], answer: "Soporte WhatsApp 24/7: +57 300 123 4567 o soporte@agromarket.co. Tambien tienes la pagina Ayuda y Reportar un problema con seguimiento." }
];

// EN
const en = [
  { id: "login", keywords: ["log in", "login", "sign in", "password", "cannot log", "locked account", "enter"], answer: "To log in: 1) Go to Login. 2) Enter email and password. 3) Use Forgot password. If locked, wait 15 min or contact soporte@agromarket.co." },
  { id: "email", keywords: ["email", "verification", "did not receive", "spam", "confirm account", "code"], answer: "If you did not receive the email: 1) Check spam/promotions. 2) Confirm email spelling. 3) Request a new code from Verify email. 4) After 10 min, contact soporte@agromarket.co." },
  { id: "currency", keywords: ["currency", "dollar", "euro", "cop", "usd", "price in", "does not change"], answer: "Open the currency selector in the top bar (e.g. COP) and choose USD, EUR, BRL, MXN, CLP, PEN, ARS, CAD, JPY or CNY. Everything (home, catalog, detail, cart, checkout) recalculates instantly." },
  { id: "language", keywords: ["language", "english", "spanish", "translation", "does not change"], answer: "Open the language selector (ES) in the top bar and choose from the 7 languages. The whole project translates instantly, including help and legal pages." },
  { id: "payment", keywords: ["payment", "pay", "pse", "card", "nequi", "daviplata", "mercado pago", "rejected", "invoice"], answer: "We accept PSE, Visa/Mastercard, Nequi, Daviplata and Mercado Pago. If rejected, check funds and data, try PSE or another method and check My orders before retrying." },
  { id: "order", keywords: ["order", "does not appear", "tracking", "track", "status"], answer: "Go to My orders for status and tracking. If missing, confirm payment, reload and filter by date. Dispatch takes 24-48 h for freshness." },
  { id: "cart", keywords: ["cart", "add", "quantity", "empty", "cannot add", "stock"], answer: "Open the product, choose kg and press Add. Open the cart to adjust quantities. Check stock and log in before checkout." },
  { id: "sell", keywords: ["sell", "producer", "publish", "farm", "harvest", "i want to sell"], answer: "To sell: 1) Register as Producer. 2) Complete farm profile. 3) Publish with price per kg and stock. 4) Manage orders. ASAFRUT help: +57 300 123 4567." },
  { id: "shipping", keywords: ["shipping", "delivery", "dispatch", "delay", "address"], answer: "Shipping cost is calculated at checkout, ETA 24-48 h. Make sure address (department, city, street, references) is complete in profile and checkout step 2." },
  { id: "returns", keywords: ["return", "refund", "damaged", "bad condition", "photo"], answer: "If damaged, take photos within 12 hours and report in Report a problem or WhatsApp +57 300 123 4567. We replace or refund." },
  { id: "account", keywords: ["account", "profile", "data", "phone", "saved address", "delete account"], answer: "Update name, phone, address and photo in My profile. To delete or correct personal data, write to privacidad@agro-market.app." },
  { id: "messages", keywords: ["message", "chat", "talk to", "contact producer", "messaging"], answer: "Use Messages to talk to producers or support. If a chat does not load, reload and check your connection." },
  { id: "help", keywords: ["help", "support", "contact", "whatsapp", "phone"], answer: "Support WhatsApp 24/7: +57 300 123 4567 or soporte@agromarket.co. Also see Help and Report a problem." }
];

// PT
const pt = [
  { id: "login", keywords: ["entrar", "login", "acessar", "senha", "nao consigo entrar", "conta bloqueada"], answer: "Para entrar: 1) Vai a Entrar. 2) Coloca e-mail e senha. 3) Usa Esqueci a senha. Se bloqueada, espera 15 min ou escreve a soporte@agromarket.co." },
  { id: "email", keywords: ["e-mail", "email", "verificacao", "nao recebi", "spam", "confirmar conta", "codigo"], answer: "Se nao recebeste o e-mail: 1) Verifica spam. 2) Confirma o e-mail no perfil. 3) Pede novo codigo. 4) Após 10 min, escreve a soporte@agromarket.co." },
  { id: "currency", keywords: ["moeda", "divisa", "dolar", "euro", "cop", "usd", "precio em", "nao muda"], answer: "Abre o seletor de moeda no topo (ex. COP) e escolhe USD, EUR, BRL, MXN, CLP, PEN, ARS, CAD, JPY ou CNY. Todo se recalcula na hora." },
  { id: "language", keywords: ["idioma", "lingua", "ingles", "espanol", "traducao", "nao muda"], answer: "Abre o seletor de idioma (ES) no topo e escolhe entre os 7 idiomas. Todo o projeto se traduze na hora." },
  { id: "payment", keywords: ["pagamento", "pagar", "pse", "cartao", "nequi", "rejeitado", "factura"], answer: "Aceptamos PSE, Visa/Mastercard, Nequi, Daviplata e Mercado Pago. Verifica saldo e dados, prova PSE e revisa Meus pedidos." },
  { id: "order", keywords: ["pedido", "nao aparece", "rastrear", "estado"], answer: "Vai a Meus pedidos para estado e rastreo. Confirma o pagamento, recarga e filtra por data. Envio 24-48 h." },
  { id: "cart", keywords: ["carrinho", "adicionar", "quantidade", "estoque"], answer: "Abre o produto, escolhe kg e toca Adicionar. Verifica estoque e faz login." },
  { id: "sell", keywords: ["vender", "produtor", "publicar", "fazenda"], answer: "Registra-te como Produtor, completa a fazenda e publica com preço por kg. Ajuda: +57 300 123 4567." },
  { id: "shipping", keywords: ["entrega", "envio", "endereco", "atraso"], answer: "Custo no checkout, prazo 24-48 h. Verifica endereço completo no perfil e passo 2." },
  { id: "returns", keywords: ["devolucion", "reembolso", "danificado", "foto"], answer: "Tira fotos em 12 h e reporta em Reportar problema ou WhatsApp +57 300 123 4567." },
  { id: "help", keywords: ["ajuda", "suporte", "whatsapp", "contacto"], answer: "Suporte WhatsApp 24/7: +57 300 123 4567 ou soporte@agromarket.co." }
];

// FR
const fr = [
  { id: "login", keywords: ["connexion", "connecter", "mot de passe", "je ne peux pas me connecter", "compte bloque"], answer: "Pour vous connecter: 1) Allez à Connexion. 2) Entrez e-mail et mot de passe. 3) Mot de passe oublié. Compte bloqué: attendez 15 min ou écrivez à soporte@agromarket.co." },
  { id: "email", keywords: ["e-mail", "email", "verification", "pas recu", "spam", "code"], answer: "Pas reçu? 1) Vérifiez spam. 2) Adresse dans le profil. 3) Nouveau code depuis Vérifier e-mail. 4) Après 10 min, soporte@agromarket.co." },
  { id: "currency", keywords: ["devise", "monnaie", "dollar", "euro", "cop", "usd", "prix en", "ne change pas"], answer: "Ouvrez le sélecteur de devise en haut (ex. COP) et choisissez USD, EUR, BRL, MXN, CLP, PEN, ARS, CAD, JPY ou CNY. Tout se recalcule instantanément." },
  { id: "language", keywords: ["langue", "anglais", "espagnol", "traduction", "ne change pas"], answer: "Ouvrez le sélecteur de langue (ES) en haut et choisissez parmi les 7 langues. Tout se traduit instantanément." },
  { id: "payment", keywords: ["paiement", "payer", "pse", "carte", "nequi", "refuse", "facture"], answer: "PSE, Visa/Mastercard, Nequi, Daviplata et Mercado Pago. Vérifiez fonds, essayez PSE et vérifiez Mes commandes." },
  { id: "order", keywords: ["commande", "n'apparait pas", "suivi", "statut"], answer: "Allez à Mes commandes pour le statut. Confirmez le paiement, rechargez, filtrez. Expédition 24-48 h." },
  { id: "cart", keywords: ["panier", "ajouter", "quantite", "stock"], answer: "Ouvrez le produit, choisissez les kg et ajoutez. Vérifiez stock et connectez-vous." },
  { id: "sell", keywords: ["vendre", "producteur", "publier", "ferme"], answer: "Inscrivez-vous comme Producteur, complétez la ferme et publiez. Aide: +57 300 123 4567." },
  { id: "shipping", keywords: ["livraison", "envoi", "adresse", "retard"], answer: "Coût calculé au checkout, 24-48 h. Vérifiez l'adresse au profil et étape 2." },
  { id: "returns", keywords: ["retour", "remboursement", "abime", "photo"], answer: "Photos sous 12 h et Signaler un problème ou WhatsApp +57 300 123 4567." },
  { id: "help", keywords: ["aide", "support", "whatsapp", "contact"], answer: "Support WhatsApp 24/7: +57 300 123 4567 ou soporte@agromarket.co." }
];

// DE
const de = [
  { id: "login", keywords: ["anmelden", "login", "passwort", "kann mich nicht anmelden", "konto gesperrt"], answer: "Zum Anmelden: 1) Gehe zu Login. 2) E-Mail und Passwort eingeben. 3) Passwort vergessen nutzen. Gesperrt: 15 Min warten oder soporte@agromarket.co schreiben." },
  { id: "email", keywords: ["e-mail", "email", "bestatigung", "nicht erhalten", "spam", "code"], answer: "Nicht erhalten? 1) Spam prüfen. 2) Adresse im Profil prüfen. 3) Neuen Code anfordern. 4) Nach 10 Min: soporte@agromarket.co." },
  { id: "currency", keywords: ["wahrung", "geld", "dollar", "euro", "cop", "usd", "preis in", "andert sich nicht"], answer: "Währungsauswahl oben öffnen (z. B. COP) und USD, EUR, BRL, MXN, CLP, PEN, ARS, CAD, JPY oder CNY wählen. Alles rechnet sofort um." },
  { id: "language", keywords: ["sprache", "englisch", "spanisch", "ubersetzung", "andert sich nicht"], answer: "Sprachauswahl (ES) oben öffnen und aus den 7 Sprachen wählen. Alles übersetzt sofort." },
  { id: "payment", keywords: ["zahlung", "zahlen", "pse", "karte", "nequi", "abgelehnt", "rechnung"], answer: "PSE, Visa/Mastercard, Nequi, Daviplata und Mercado Pago. Guthaben prüfen, PSE versuchen, Meine Bestellungen prüfen." },
  { id: "order", keywords: ["bestellung", "erscheint nicht", "verfolgung", "status"], answer: "Meine Bestellungen für Status und Tracking. Zahlung prüfen, neu laden, nach Datum filtern. Versand 24-48 h." },
  { id: "cart", keywords: ["warenkorb", "hinzufugen", "menge", "bestand"], answer: "Produkt öffnen, kg wählen, Hinzufügen. Bestand prüfen und anmelden." },
  { id: "sell", keywords: ["verkaufen", "produzent", "veroffentlichen", "farm"], answer: "Als Produzent registrieren, Farmprofil vervollständigen und veröffentlichen. Hilfe: +57 300 123 4567." },
  { id: "shipping", keywords: ["versand", "lieferung", "adresse", "verspatung"], answer: "Kosten im Checkout, Lieferzeit 24-48 h. Adresse im Profil und Schritt 2 prüfen." },
  { id: "returns", keywords: ["ruckgabe", "erstattung", "beschadigt", "foto"], answer: "Fotos in 12 h und Problem melden oder WhatsApp +57 300 123 4567." },
  { id: "help", keywords: ["hilfe", "support", "whatsapp", "kontakt"], answer: "Support WhatsApp 24/7: +57 300 123 4567 oder soporte@agromarket.co." }
];

// ZH
const zh = [
  { id: "login", keywords: ["登录", "密码", "无法登录", "账户锁定"], answer: "登录方法：前往“登录”，输入邮箱和密码，或使用“忘记密码”。账户锁定请等待15分钟或联系 soporte@agromarket.co。" },
  { id: "email", keywords: ["邮件", "验证", "没收到", "垃圾邮件", "验证码"], answer: "未收到邮件？1) 检查垃圾邮件。2) 确认邮箱拼写。3) 重新发送验证码。4) 10分钟后联系 soporte@agromarket.co。" },
  { id: "currency", keywords: ["货币", "币种", "美元", "欧元", "价格", "不变化"], answer: "点击顶部货币选择器（如 COP），选择 USD、EUR、BRL、MXN、CLP、PEN、ARS、CAD、JPY 或 CNY。全站即时重新计算。" },
  { id: "language", keywords: ["语言", "英语", "西班牙语", "翻译", "不变"], answer: "点击顶部语言选择器（ES），从7种语言中选择。全站即时翻译。" },
  { id: "payment", keywords: ["支付", "付款", "银行卡", "被拒", "发票"], answer: "支持 PSE、Visa/Mastercard、Nequi、Daviplata 和 Mercado Pago。检查余额、尝试 PSE 并查看“我的订单”。" },
  { id: "order", keywords: ["订单", "不显示", "跟踪", "状态"], answer: "前往“我的订单”查看状态和跟踪。确认支付、刷新、按日期筛选。发货24-48小时。" },
  { id: "cart", keywords: ["购物车", "添加", "数量", "库存"], answer: "打开商品选择公斤数并点击添加。检查库存并登录。" },
  { id: "sell", keywords: ["卖", "销售", "生产者", "农场"], answer: "注册为生产者、完善农场资料并发布。帮助：+57 300 123 4567。" },
  { id: "shipping", keywords: ["配送", "发货", "地址", "延迟"], answer: "结算时计算费用，时效24-48小时。检查资料和第2步的地址。" },
  { id: "returns", keywords: ["退货", "退款", "损坏", "照片"], answer: "12小时内拍照，报告问题或 WhatsApp +57 300 123 4567。" },
  { id: "help", keywords: ["帮助", "支持", "联系", "电话"], answer: "客服 WhatsApp 24/7：+57 300 123 4567 或 soporte@agromarket.co。" }
];

// AR
const ar = [
  { id: "login", keywords: ["تسجيل الدخول", "دخول", "كلمة المرور", "لا استطيع الدخول", "مقفل"], answer: "لتسجيل الدخول: اذهب إلى الدخول وأدخل البريد وكلمة المرور أو استخدم نسيت كلمة المرور. إذا كان مقفلاً انتظر 15 دقيقة أو راسل soporte@agromarket.co." },
  { id: "email", keywords: ["بريد", "تحقق", "لم يصلني", "سبام", "رمز"], answer: "لم يصلك؟ تحقق من Spam، تأكد من البريد في الملف، اطلب رمزاً جديداً، بعد 10 دقائق راسل soporte@agromarket.co." },
  { id: "currency", keywords: ["عملة", "دولار", "يورو", "السعر", "لا تتغير"], answer: "افتح محدد العملة في الأعلى (مثل COP) واختر USD أو EUR أو BRL أو MXN أو CLP أو PEN أو ARS أو CAD أو JPY أو CNY. كل شيء يحدّث فوراً." },
  { id: "language", keywords: ["لغة", "انجليزية", "اسبانيا", "ترجمة", "لا تتغير"], answer: "افتح محدد اللغة (ES) في الأعلى واختر من بين 7 لغات. كل المشروع يترجم فوراً." },
  { id: "payment", keywords: ["دفع", "بطاقة", "مرفوض", "فاتورة"], answer: "نقبل PSE وVisa/Mastercard وNequi وDaviplata وMercado Pago. تحقق من الرصيد وجرب PSE وراجع طلباتي." },
  { id: "order", keywords: ["طلب", "لا يظهر", "تتبع", "حالة"], answer: "اذهب إلى طلباتي للحالة والتتبع. أكد الدفع وحدّث الصفحة ورشّح بالتاريخ. الشحن 24-48 ساعة." },
  { id: "cart", keywords: ["سلة", "اضافة", "كمية", "مخزون"], answer: "افتح المنتج واختر الكيلو واضغط إضافة. تحقق من المخزون وسجّل الدخول." },
  { id: "sell", keywords: ["بيع", "منتج", "نشر", "مزرعة"], answer: "سجّل كمنتج وأكمل المزرعة وانشر بالسعر. مساعدة: +57 300 123 4567." },
  { id: "shipping", keywords: ["شحن", "توصيل", "عنوان", "تاخير"], answer: "تُحسب التكلفة في الدفع والتسليم 24-48 ساعة. تحقق من العنوان في الملف والخطوة 2." },
  { id: "returns", keywords: ["ارجاع", "استرداد", "تالف", "صورة"], answer: "التقط صوراً خلال 12 ساعة وأبلغ عبر الإبلاغ عن مشكلة أو واتساب +57 300 123 4567." },
  { id: "help", keywords: ["مساعدة", "دعم", "واتساب", "اتصال"], answer: "الدعم واتساب 24/7: +57 300 123 4567 أو soporte@agromarket.co." }
];

const knowledgeBase = { es, en, pt, fr, de, zh, ar };

export default knowledgeBase;