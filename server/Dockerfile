# Dockerfile para el servidor Socket.io de AgroMarket

# Usar imagen oficial de Node.js
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto de los archivos
COPY . .

# Crear directorio para logs
RUN mkdir -p /app/logs

# Exponer el puerto del servidor
EXPOSE 3001

# Comando de inicio
CMD ["node", "index.js"]
