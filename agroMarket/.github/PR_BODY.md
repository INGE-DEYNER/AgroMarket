Resumen

Este PR implementa el soporte completo de envío de correos para recuperación de contraseña y verificación de correo, integra tests unitarios e integración con GreenMail, y añade la infraestructura de seguridad JWT + protección por roles en el backend. También wireé el frontend para usar llamadas reales al backend (autenticación, recuperación/restablecimiento/verify) y añadí plantillas de email.

Cambios principales

- Backend:
  - Seguridad: `JwtTokenProvider`, `JwtAuthenticationFilter`, `SecurityConfig`, `UserDetailsServiceImpl` y uso de `@PreAuthorize` en controladores.
  - Servicios: `PasswordResetServiceImpl`, `EmailVerificationServiceImpl`, `EmailServiceImpl`.
  - Migraciones: `V4__password_reset_and_verification.sql` (consolidado).
  - Test support: `MailAutoConfiguration`, `TestMailConfig`.

- Tests:
  - Unit: `EmailServiceTest`, `PasswordResetServiceTest`, `RateLimiterServiceTest`.
  - Integration: `PasswordResetGreenMailIT` (usa GreenMail SMTP; pasa localmente).

- Frontend:
  - `frontend/js/api.js`: añade `Authorization` header, manejo de 401 y errores de red.
  - `frontend/js/auth.js`, `login.js`, `admin.js` y páginas relacionadas: guardado de token, resoluciones de rutas según rol, protección de páginas.
  - Páginas y scripts de recuperación/verificación: `recuperar-contrasena.html`, `restablecer-contrasena.html`, `verificar-correo.html` y sus `js` y `css` asociados.

Checklist (estado actual)

- [x] Migraciones consolidadas en `V4__password_reset_and_verification.sql`
- [x] Implementación de `EmailServiceImpl` y plantillas de email
- [x] Tests unitarios y de integración con GreenMail — CI local pasa
- [x] Seguridad JWT y protección por roles en backend
- [x] Frontend wireado para auth y flows de recuperación/verificación (excepto `catalogo.html`)
- [ ] Añadir más ITs para verificación completa de flujo de usuario (pendiente)

Instrucciones rápidas

Para correr la suite completa de tests localmente:

```bash
mvn test
```

Para ejecutar solo el IT de GreenMail:

```bash
mvn -Dtest=PasswordResetGreenMailIT test
```

Notas

- Preparé la rama `feature/email-greenmail-integration` y la publiqué en el remoto. No creé el PR desde la CLI porque `gh` no está autenticado; puedes crear el PR desde GitHub o autorizar `gh` localmente.
- Próximo paso: limpieza final del frontend (eliminar datos quemados restantes, revisar `catalogo.html` por exclusión) y ampliar ITs para cubrir el flujo de verificación/registro.
