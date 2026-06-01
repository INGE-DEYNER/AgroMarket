#!/usr/bin/env bash
# Script de despliegue remoto para ejecutar en la VM (~/AgroMarket)
set -e
cd "$(dirname "$0")/.." || true
# Asegúrate de tener .env.production en la carpeta raíz
git pull origin main || true
docker pull TU_DOCKERHUB_USER/agromarket:latest || true
docker compose up -d --remove-orphans --build
