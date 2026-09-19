#!/bin/bash

# Script para instalar dependencias del servidor Socket.io

echo "Instalando dependencias del servidor Socket.io..."
echo "================================================"

# Navegar al directorio del servidor
cd "$(dirname "$0")"

# Verificar si npm está disponible
if command -v npm &> /dev/null; then
    echo "Usando npm..."
    npm install
    echo ""
    echo "Dependencias instaladas correctamente!"
    echo "Para iniciar el servidor, ejecuta:"
    echo "  npm start"
    echo ""
    echo "O en modo desarrollo:"
    echo "  npm run dev"
else
    echo "Error: npm no está instalado."
    echo "Por favor, instala Node.js y npm antes de continuar."
    exit 1
fi
