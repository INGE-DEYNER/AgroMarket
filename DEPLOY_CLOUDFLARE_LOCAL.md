# Despliegue 100% gratuito — nube nunca, expone tu máquina con Cloudflare Tunnel

Resumen rápido: vamos a ejecutar la aplicación en tu máquina (Docker Compose), exponerla públicamente usando `cloudflared` (tunnel) y probar sin pagar nada. Limitaciones: tu máquina debe estar encendida y con conexión pública (o NAT con redirección de puertos si usas DuckDNS). Esta opción evita crear VM en la nube.

Requisitos:

- Docker Desktop (Windows)
- Git
- cloudflared (https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation)
- Cuenta Cloudflare (opcional solo para túneles permanentes con dominio). Para la opción rápida no hace falta cuenta: usamos `trycloudflare.com`.
- Opcional: DuckDNS si quieres un nombre legible (pero requiere IP pública alcanzable desde internet y redirección de puertos si estás detrás de NAT).

Pasos detallados

1. Ejecutar MySQL y la app con Docker Compose

- Desde la raíz del repo:

```powershell
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket
# Ajusta si tu compose está en otra carpeta
docker compose -f docker-compose.yml up -d db
# esperar que MySQL arranque
# luego levantar backend+frontend (si están en el compose)
docker compose up -d
```

- Si no tienes `db` en compose, puedes levantar manualmente:

```powershell
docker run -d --name agromysql -e MYSQL_ROOT_PASSWORD=changeme -e MYSQL_DATABASE=agromarket -p 3306:3306 mysql:8
```

- Asegúrate de que `application.properties` o variables de entorno apunten a `jdbc:mysql://localhost:3306/agromarket` (cuando ejecutas local).

2. Probar que la app responde localmente

- Backend: http://localhost:8080/actuator/health
- Frontend: abrir `frontend/home.html` o si serviste con nginx: http://localhost:80

3. Instalar `cloudflared` (Windows)

- Descarga: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation
- Extrae `cloudflared.exe` y colocarlo en `C:\Windows\System32` o en una carpeta del PATH.

4. Quick Tunnel (URL pública temporal bajo trycloudflare.com)

- Desde PowerShell (ejecutar como usuario normal):

```powershell
# Exponer el puerto 8080 (backend)
cloudflared tunnel --url http://localhost:8080
```

- Resultado: verás una URL `https://xxxx.trycloudflare.com` — úsala como `APP_FRONTEND_URL` temporal para probar OAuth/redirects.
- Nota: esta URL cambia cada vez que reinicias cloudflared en modo quick-tunnel; es ideal para pruebas rápidas.

5. Ejecutar Tunnel como servicio (Windows) — opción persistente

- Para instalar como servicio (requiere cuenta Cloudflare y autenticación) sigue la guía oficial. Si prefieres, ejecuta cloudflared en background con `schtasks` o `nssm`.

6. Usar DuckDNS (opcional, requiere IP pública alcanzable)

- Si tienes IP pública, registra `miagromarket.duckdns.org` y actualiza su IP con `scripts/duckdns_update.sh` o con un cliente Windows.
- Donde DuckDNS apunte a tu IP, instala Caddy o usa `cloudflared` con cuenta Cloudflare para enlazar el hostname a tu tunnel.

7. SMTP/Emails en desarrollo (gratis)

- Para pruebas, usar Mailtrap o Ethereal (both free for dev). Mailgun tiene plan gratuito limitado.
- Configura `MAIL_*` en `.env.production` o en `application.properties` para usar la cuenta de pruebas.

8. Consideraciones de seguridad

- No expongas puertos administrativos.
- Asegura `JWT_SECRET` y credenciales en variables de entorno.

9. Probar flujo completo

- Con la URL `https://xxxx.trycloudflare.com` configurada como `APP_FRONTEND_URL` en `application.properties` (o variable), prueba registro, verificación de correo y login/2FA.

10. Si en el futuro quieres pasar a un host gratuito (Fly.io/Render) puedo preparar el `Dockerfile` y el workflow de GitHub Actions para desplegar sin tocar tu máquina.

Si quieres, hago ahora:

- A) Instrucciones paso a paso para Windows para instalar `cloudflared` y ejecutarlo en background. (recomendado para 100% gratis)
- B) Ajusto `application.properties` en el repo para usar variables `APP_FRONTEND_URL` y mostrar cómo cambiarlas.
- C) Genero comandos `docker compose` exactos para tu repo y compruebo si `docker-compose.yml` contiene servicios `db`, `app`, `frontend`.

Elige A/B/C y sigo con el siguiente bloque de pasos concretos y comandos que puedes ejecutar ahora.
