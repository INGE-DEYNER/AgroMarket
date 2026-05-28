Resumen

Este PR agrega tests de integración para envío de correos usando GreenMail y provee una `TestConfiguration` para forzar el `JavaMailSender` a usar el puerto SMTP de GreenMail durante los tests.

Cambios principales

- Tests: `PasswordResetGreenMailIT`, `EmailServiceTest`, `PasswordResetServiceTest`, `RateLimiterServiceTest`.
- Configuración de tests: `TestMailConfig` y `PasswordResetGreenMailIT.MailConfig` que crean un `JavaMailSender` apuntando a GreenMail.
- Servicio de email: `EmailServiceImpl` y plantillas `password-reset.html`, `email-verification.html`.
- Migraciones: consolidación en `V4__password_reset_and_verification.sql`.
- Frontend: páginas y scripts para recuperación/restablecimiento/verificación (sin tocar `catalogo.html`).

Checklist

- [x] Migraciones consolidadas en `V4__password_reset_and_verification.sql`
- [x] Tests unitarios para email y rate limiter
- [x] Test de integración con GreenMail funcionando
- [x] `MailAutoConfiguration` para fallback en entorno sin SMTP
- [ ] Añadir más ITs para flujo de verificación (pendiente)
- [ ] Revisar endpoints de seguridad y roles en frontend (próxima fase)

Notas

- Ejecutar `mvn -Dtest=PasswordResetGreenMailIT test` localmente para verificar el IT.
- Si tucierto CI no tiene `gh` ni credenciales, puedes crear el PR manualmente en:
  https://github.com/INGE-DEYNER/AgroMarket/pull/new/feature/email-greenmail-integration
