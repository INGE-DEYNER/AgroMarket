## Cómo activar Twilio real
1. Obtén Account SID, Auth Token y número de teléfono en twilio.com
2. Agrega al .env: TWILIO_ACCOUNT_SID=xxx TWILIO_AUTH_TOKEN=xxx TWILIO_PHONE=+1xxx
3. En Coolify, activa el perfil: SPRING_PROFILES_ACTIVE=prod,twilio

## Cómo activar PSE / pasarela real
1. Crear implementación real de PasarelaPagoService con el SDK de la pasarela elegida
2. Registrar el webhook en el panel de la pasarela apuntando a: POST /api/pago/webhook
3. En Coolify, activa el perfil: SPRING_PROFILES_ACTIVE=prod,pse
