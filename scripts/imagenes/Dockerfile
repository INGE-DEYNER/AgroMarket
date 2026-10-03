# Contenedor para optimizar las imagenes del frontend.
#
# POR QUE UN CONTENEDOR Y NO sharp EN EL HOST: sharp trae binarios nativos
# para la plataforma, y en Windows habia que instalar la version correcta a
# mano. Dentro de un contenedor linux se resuelve solo y el resultado es el
# mismo que dara el build de produccion.
#
# Solo se usa para transformar archivos. No se despliega.

FROM node:22-alpine

WORKDIR /opt

# Se instala sharp (con sus binarios) y nada mas. La app no se copia aqui:
# esto es una herramienta, no un servicio.
RUN npm init -y >/dev/null 2>&1 \
    && npm install --no-audit --no-fund sharp@0.33.5

COPY optimiza-imagenes.mjs /opt/optimiza-imagenes.mjs

# Se ejecuta con `docker run` pasando las rutas por volumen, no por CMD: las
# rutas cambian segun donde este el checkout.
CMD ["node", "/opt/optimiza-imagenes.mjs"]