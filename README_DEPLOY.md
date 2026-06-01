# Despliegue de AgroMarket — Guía rápida

Este documento contiene los pasos necesarios para crear cuentas y desplegar el proyecto AgroMarket en una VM gratis (Oracle Cloud Always Free), DNS dinámico (DuckDNS), registro de imágenes en Docker Hub, y TLS con Caddy o Certbot.

Requisitos previos (local):

- Git configurado y acceso SSH a tu cuenta de GitHub
- Docker y Docker Compose (para construir localmente)
- Claves SSH (`ssh-keygen`) para acceso a la VM

1. Crear cuentas (resumen)

- GitHub: https://github.com/signup — crea el repo `TU_USUARIO/AgroMarket` y sube el código.
- Docker Hub: https://hub.docker.com/signup — crea repo `TU_USUARIO/agromarket`.
- DuckDNS: https://www.duckdns.org/ — crea subdominio `miagromarket` y copia el `token`.
- Oracle Cloud Free Tier: https://cloud.oracle.com/free — regístrate y crea una instancia Always Free (Ubuntu 22.04).
- Mailgun (o servicio SMTP): https://signup.mailgun.com/ — anota credenciales SMTP.

2. Generar claves SSH (local)

```bash
ssh-keygen -t ed25519 -C "tu@email.com"
# copiar ~/.ssh/id_ed25519.pub en la consola de Oracle al crear la VM
```

3. Provisionar VM (Oracle)

- Crear instancia Always Free (VM.Standard.E2.1.Micro)
- Imagen: Ubuntu 22.04
- Añadir la clave pública SSH
- Abrir puertos: 22, 80, 443, 8080

4. Preparar la VM (comandos rápidos)

```bash
# Conectar (ejemplo usuario ubuntu)
ssh ubuntu@IP_PUBLICA
# Actualizar e instalar docker
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker $USER
# Docker Compose v2
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

5. Variables de entorno y `.env.production` (plantilla en repo)

- Rellenar: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`, `APP_FRONTEND_URL=https://miagromarket.duckdns.org`, `MAIL_*`.

6. Construir y subir imagen (local o CI):

```bash
# local
docker build -t tuusuario/agromarket:latest ./agroMarket
docker push tuusuario/agromarket:latest
```

7. Despliegue en la VM (clonar y arrancar):

```bash
git clone git@github.com:TU_USUARIO/AgroMarket.git
cd AgroMarket
# crear .env.production con valores
docker compose up -d --build
docker compose logs -f
```

8. DNS y TLS

- Configurar DuckDNS para apuntar la IP pública y crear cron job para actualizar la IP.
- Instalar Caddy en la VM y crear `Caddyfile` para `miagromarket.duckdns.org` que haga reverse_proxy a `localhost:8080`.

9. Verificaciones

- Revisar `/actuator/health` (si lo tienes habilitado) o la página principal.
- Probar registro; verificar envío de correo (Mailgun) y flujo OAuth/2FA.

10. CI/CD (opcional)

- Añadir workflow en `.github/workflows/ci-deploy.yml` que construya, publique a Docker Hub y haga SSH para desplegar en la VM.

---

Si quieres que cree los archivos de ejemplo (`.github` workflow, `.env.production.template`, `scripts/duckdns_update.sh`, `Caddyfile`, `scripts/deploy_remote.sh`) los genero ahora y luego te guío paso a paso ejecutando cada acción.
