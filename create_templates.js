const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'agroMarket/src/main/resources/email-templates');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const languages = ['es', 'en', 'pt', 'fr', 'de', 'zh', 'ar'];

const templateData = {
  verificacion: {
    es: {
      title: "Verificación de correo",
      body: "Hola <strong>${correoMascarado}</strong>, confirma tu cuenta para empezar a usar AgroMarket.",
      codeLabel: "Código de 6 dígitos",
      codeDesc: "Este código vence en 15 minutos. También puedes usar el botón de abajo para ir directo a la pantalla de verificación.",
      btnText: "Verificar correo",
      urlLabel: "Si el botón no abre, copia y pega este enlace en tu navegador:",
      urlVar: "${verifyUrl}"
    },
    en: {
      title: "Email Verification",
      body: "Hello <strong>${correoMascarado}</strong>, confirm your account to start using AgroMarket.",
      codeLabel: "6-digit Code",
      codeDesc: "This code expires in 15 minutes. You can also use the button below to go directly to the verification screen.",
      btnText: "Verify Email",
      urlLabel: "If the button doesn't open, copy and paste this link in your browser:",
      urlVar: "${verifyUrl}"
    },
    pt: {
      title: "Verificação de E-mail",
      body: "Olá <strong>${correoMascarado}</strong>, confirme sua conta para começar a usar o AgroMarket.",
      codeLabel: "Código de 6 dígitos",
      codeDesc: "Este código expira em 15 minutos. Você também pode usar o botão abaixo para ir diretamente para a tela de verificação.",
      btnText: "Verificar E-mail",
      urlLabel: "Se o botão não abrir, copie e cole este link no seu navegador:",
      urlVar: "${verifyUrl}"
    },
    fr: {
      title: "Vérification d'E-mail",
      body: "Bonjour <strong>${correoMascarado}</strong>, confirmez votre compte pour commencer à utiliser AgroMarket.",
      codeLabel: "Code à 6 chiffres",
      codeDesc: "Ce code expire dans 15 minutes. Vous pouvez également utiliser le bouton ci-dessous pour accéder directement à l'écran de vérification.",
      btnText: "Vérifier l'E-mail",
      urlLabel: "Si le bouton ne s'ouvre pas, copiez et collez ce lien dans votre navigateur :",
      urlVar: "${verifyUrl}"
    },
    de: {
      title: "E-Mail-Verifizierung",
      body: "Hallo <strong>${correoMascarado}</strong>, bestätigen Sie Ihr Konto, um AgroMarket zu nutzen.",
      codeLabel: "6-stelliger Code",
      codeDesc: "Dieser Code läuft in 15 Minuten ab. Sie können auch die Schaltfläche unten verwenden, um direkt zum Verifizierungsbildschirm zu gelangen.",
      btnText: "E-Mail verifizieren",
      urlLabel: "Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:",
      urlVar: "${verifyUrl}"
    },
    zh: {
      title: "电子邮件验证",
      body: "您好 <strong>${correoMascarado}</strong>，请确认您的账户以开始使用 AgroMarket。",
      codeLabel: "6位验证码",
      codeDesc: "该验证码将在15分钟内失效。您也可以使用下面的按钮直接进入验证页面。",
      btnText: "验证电子邮件",
      urlLabel: "如果按钮无法打开，请复制并粘贴此链接到您的浏览器：",
      urlVar: "${verifyUrl}"
    },
    ar: {
      title: "التحقق من البريد الإلكتروني",
      body: "مرحباً <strong>${correoMascarado}</strong>، يرجى تأكيد حسابك لبدء استخدام AgroMarket.",
      codeLabel: "رمز مكون من 6 أرقام",
      codeDesc: "تنتهي صلاحية هذا الرمز خلال 15 دقيقة. يمكنك أيضاً استخدام الزر أدناه للانتقال مباشرة إلى شاشة التحقق.",
      btnText: "التحقق من البريد",
      urlLabel: "إذا لم يفتح الزر، انسخ هذا الرابط والصقه في متصفحك:",
      urlVar: "${verifyUrl}"
    }
  },
  reset: {
    es: {
      title: "Recuperación de contraseña",
      body: "Recibimos una solicitud para restablecer tu contraseña. El enlace es seguro y expira en 1 hora.",
      codeLabel: "Instrucciones",
      codeDesc: "<ul><li>Haz clic en el botón para abrir la página de restablecimiento.</li><li>El enlace solo funciona una vez y caduca automáticamente.</li><li>Si no solicitaste este cambio, ignora este correo.</li></ul>",
      btnText: "Restablecer contraseña",
      urlLabel: "Si el botón no abre, copia y pega este enlace en tu navegador:",
      urlVar: "${resetUrl}"
    },
    en: {
      title: "Password Reset",
      body: "We received a request to reset your password. The link is secure and expires in 1 hour.",
      codeLabel: "Instructions",
      codeDesc: "<ul><li>Click the button to open the reset page.</li><li>The link only works once and expires automatically.</li><li>If you did not request this change, please ignore this email.</li></ul>",
      btnText: "Reset Password",
      urlLabel: "If the button doesn't open, copy and paste this link in your browser:",
      urlVar: "${resetUrl}"
    },
    pt: {
      title: "Recuperação de Senha",
      body: "Recebemos uma solicitação para redefinir sua senha. O link é seguro e expira em 1 hora.",
      codeLabel: "Instruções",
      codeDesc: "<ul><li>Clique no botão para abrir a página de redefinição.</li><li>O link funciona apenas uma vez e expira automaticamente.</li><li>Se você não solicitou esta alteração, ignore este e-mail.</li></ul>",
      btnText: "Redefinir Senha",
      urlLabel: "Se o botão não abrir, copie e cole este link no seu navegador:",
      urlVar: "${resetUrl}"
    },
    fr: {
      title: "Récupération de mot de passe",
      body: "Nous avons reçu une demande de réinitialisation de votre mot de passe. Le lien est sécurisé et expire dans 1 heure.",
      codeLabel: "Instructions",
      codeDesc: "<ul><li>Cliquez sur le bouton pour ouvrir la page de réinitialisation.</li><li>Le lien ne fonctionne qu'une seule fois et expire automatiquement.</li><li>Si vous n'avez pas demandé ce changement, veuillez ignorer cet e-mail.</li></ul>",
      btnText: "Réinitialiser le mot de passe",
      urlLabel: "Si le bouton ne s'ouvre pas, copiez et collez ce lien dans votre navigateur :",
      urlVar: "${resetUrl}"
    },
    de: {
      title: "Passwort zurücksetzen",
      body: "Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Der Link ist sicher und läuft in 1 Stunde ab.",
      codeLabel: "Anweisungen",
      codeDesc: "<ul><li>Klicken Sie auf die Schaltfläche, um die Seite zum Zurücksetzen zu öffnen.</li><li>Der Link funktioniert nur einmal und läuft automatisch ab.</li><li>Wenn Sie diese Änderung nicht angefordert haben, ignorieren Sie diese E-Mail.</li></ul>",
      btnText: "Passwort zurücksetzen",
      urlLabel: "Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:",
      urlVar: "${resetUrl}"
    },
    zh: {
      title: "密码重置",
      body: "我们收到了重置您密码的请求。该链接是安全的，将在1小时内失效。",
      codeLabel: "说明",
      codeDesc: "<ul><li>点击按钮打开重置页面。</li><li>此链接仅可使用一次，并将自动失效。</li><li>如果您未请求此更改，请忽略此电子邮件。</li></ul>",
      btnText: "重置密码",
      urlLabel: "如果按钮无法打开，请复制并粘贴此链接到您的浏览器：",
      urlVar: "${resetUrl}"
    },
    ar: {
      title: "إعادة تعيين كلمة المرور",
      body: "تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. الرابط آمن وتنتهي صلاحيته خلال ساعة واحدة.",
      codeLabel: "تعليمات",
      codeDesc: "<ul><li>انقر فوق الزر لفتح صفحة إعادة التعيين.</li><li>الرابط يعمل مرة واحدة فقط وينتهي تلقائياً.</li><li>إذا لم تطلب هذا التغيير، يرجى تجاهل هذا البريد الإلكتروني.</li></ul>",
      btnText: "إعادة تعيين كلمة المرور",
      urlLabel: "إذا لم يفتح الزر، انسخ هذا الرابط والصقه في متصفحك:",
      urlVar: "${resetUrl}"
    }
  },
  bienvenida: {
    es: {
      title: "¡Bienvenido a AgroMarket!",
      body: "Te damos la bienvenida a AgroMarket, la plataforma que conecta el campo directamente con tu mesa. Tu cuenta ha sido verificada con éxito.",
      codeLabel: "Empezar",
      codeDesc: "Ya puedes ingresar a tu cuenta y explorar el catálogo, agregar productos o gestionar tus pedidos.",
      btnText: "Ir a AgroMarket",
      urlLabel: "Usa el siguiente enlace para acceder:",
      urlVar: "https://agromarket.dev"
    },
    en: {
      title: "Welcome to AgroMarket!",
      body: "Welcome to AgroMarket, the platform that connects the field directly to your table. Your account has been verified successfully.",
      codeLabel: "Get Started",
      codeDesc: "You can now log into your account and explore the catalog, add products, or manage your orders.",
      btnText: "Go to AgroMarket",
      urlLabel: "Use the following link to access:",
      urlVar: "https://agromarket.dev"
    },
    pt: {
      title: "Bem-vindo ao AgroMarket!",
      body: "Bem-vindo ao AgroMarket, a plataforma que conecta o campo diretamente à sua mesa. Sua conta foi verificada com sucesso.",
      codeLabel: "Começar",
      codeDesc: "Agora você pode entrar na sua conta e explorar o catálogo, adicionar produtos ou gerenciar seus pedidos.",
      btnText: "Ir para o AgroMarket",
      urlLabel: "Use o seguinte link para acessar:",
      urlVar: "https://agromarket.dev"
    },
    fr: {
      title: "Bienvenue sur AgroMarket !",
      body: "Bienvenue sur AgroMarket, la plateforme qui connecte le champ directement à votre table. Votre compte a été vérifié avec succès.",
      codeLabel: "Démarrer",
      codeDesc: "Vous pouvez maintenant vous connecter à votre compte et explorer le catalogue, ajouter des produits ou gérer vos commandes.",
      btnText: "Aller sur AgroMarket",
      urlLabel: "Utilisez le lien suivant pour y accéder :",
      urlVar: "https://agromarket.dev"
    },
    de: {
      title: "Willkommen bei AgroMarket!",
      body: "Willkommen bei AgroMarket, der Plattform, die das Feld direkt mit Ihrem Tisch verbindet. Ihr Konto wurde erfolgreich verifiziert.",
      codeLabel: "Loslegen",
      codeDesc: "Sie können sich jetzt in Ihr Konto einloggen und den Katalog erkunden, Produkte hinzufügen oder Ihre Bestellungen verwalten.",
      btnText: "Gehe zu AgroMarket",
      urlLabel: "Verwenden Sie den folgenden Link, um zuzugreifen:",
      urlVar: "https://agromarket.dev"
    },
    zh: {
      title: "欢迎来到 AgroMarket！",
      body: "欢迎来到 AgroMarket，这是一个将农田直接连接到您餐桌的平台。您的账户已成功验证。",
      codeLabel: "开始体验",
      codeDesc: "您现在可以登录您的账户并浏览商品目录、添加商品或管理您的订单。",
      btnText: "进入 AgroMarket",
      urlLabel: "使用以下链接进行访问：",
      urlVar: "https://agromarket.dev"
    },
    ar: {
      title: "مرحباً بك في AgroMarket!",
      body: "مرحباً بك في AgroMarket، المنصة التي تربط الحقول مباشرة بمائدتك. تم التحقق من حسابك بنجاح.",
      codeLabel: "ابدأ الآن",
      codeDesc: "يمكنك الآن تسجيل الدخول إلى حسابك واستكشاف الكتالوج أو إضافة منتجات أو إدارة طلباتك.",
      btnText: "الذهاب إلى AgroMarket",
      urlLabel: "استخدم الرابط التالي للوصول:",
      urlVar: "https://agromarket.dev"
    }
  }
};

function getTemplateHtml(lang, data, type) {
  const isRtl = lang === 'ar';
  const directionAttr = isRtl ? 'dir="rtl"' : 'dir="ltr"';
  const textAlignment = isRtl ? 'right' : 'left';
  
  let codeSection = '';
  if (type === 'verificacion') {
    codeSection = `
      <div style="font-size: 32px; letter-spacing: 0.35em; font-weight: 800; color: #1a5c2a; text-align: center; margin: 10px 0;">
        \${codigo}
      </div>
    `;
  }

  return `<!doctype html>
<html lang="${lang}" ${directionAttr}>
  <body style="margin: 0; padding: 0; background: #f4f6f3; font-family: Arial, Helvetica, sans-serif; color: #1a2e1e;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f4f6f3; padding: 24px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 40px rgba(26, 92, 42, 0.12); border: 1px solid rgba(26, 92, 42, 0.08);">
            <tr>
              <td style="background: linear-gradient(135deg, #1a5c2a, #2d7a3a); padding: 28px 32px; color: #fff; text-align: ${textAlignment};">
                <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.8; font-weight: 700;">
                  AgroMarket
                </div>
                <h2 style="margin: 10px 0 0; font-size: 28px; line-height: 1.2; font-weight: 800;">
                  ${data.title}
                </h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px; text-align: ${textAlignment};">
                <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.7">
                  ${data.body}
                </p>
                <div style="background: #f7fbf8; border: 1px solid rgba(45, 122, 58, 0.12); border-radius: 16px; padding: 18px 20px; margin: 24px 0;">
                  <div style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #4a5d4e; font-weight: 700; margin-bottom: 8px;">
                    ${data.codeLabel}
                  </div>
                  ${codeSection}
                  <div style="margin: 12px 0 0; font-size: 14px; line-height: 1.7; color: #4a5d4e;">
                    ${data.codeDesc}
                  </div>
                </div>
                <p style="text-align: center; margin: 30px 0">
                  <a href="${data.urlVar}" style="display: inline-block; padding: 14px 26px; background: #2d7a3a; color: #fff; border-radius: 999px; text-decoration: none; font-weight: 700; box-shadow: 0 10px 24px rgba(45, 122, 58, 0.22);">
                    ${data.btnText}
                  </a>
                </p>
                <p style="margin: 18px 0 0; font-size: 13px; color: #4a5d4e; line-height: 1.6;">
                  ${data.urlLabel}
                </p>
                <p style="margin: 8px 0 0; font-size: 13px; word-break: break-all; color: #1a5c2a;">
                  ${data.urlVar}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

// Generate the 21 templates
Object.keys(templateData).forEach(type => {
  languages.forEach(lang => {
    const data = templateData[type][lang];
    const fileName = `${type}_${lang}.html`;
    const filePath = path.join(targetDir, fileName);
    const html = getTemplateHtml(lang, data, type);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Generated template ${fileName}`);
  });
});
console.log("All 21 templates generated successfully.");
