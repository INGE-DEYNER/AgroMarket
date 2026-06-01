#!/usr/bin/env bash
# Script para actualizar DuckDNS (ejecutar en la VM o en un cron desde cualquier host)
DOMAIN="miagromarket"
TOKEN="TU_TOKEN"

if [ -z "$1" ]; then
  IP=""
else
  IP="$1"
fi

curl -s "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=${IP}" | tee /tmp/duckdns_update.log
