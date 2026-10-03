#!/usr/bin/env bash
# Copia de seguridad de los datos de AgroMarket.
#
# POR QUE EXISTE: no habia ninguna. Con el contenedor parado, un
# "docker compose down -v" o un "docker volume rm" borraba la base entera sin
# dejar copia. Este script es lo unico que hay entre un incidente y la
# perdida definitiva, asi que conviene probarlo antes de necesitarlo.
#
# USO
#   scripts/backup.sh                      -> MySQL + Mongo, deja el .sql/.gz en backups/
#   scripts/backup.sh --solo mysql
#   scripts/backup.sh --restaurar <archivo>
#
# Las copias incluyen los datos personales, asi que el directorio queda con
# permisos 700 y los archivos con 600.

set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESTINO="$RAIZ/backups"
FECHA="$(date +%Y%m%d-%H%M%S)"
RETENCION_DIAS="${BACKUP_RETENCION_DIAS:-14}"

C_MYSQL="${MYSQL_CONTAINER:-asafrut-mysql}"
C_MONGO="${MONGO_CONTAINER:-asafrut-mongo}"
DB="${MYSQL_DATABASE:-agromarket}"
USER_MYSQL="${MYSQL_USER:-agromarket}"
PASS_MYSQL="${MYSQL_PASSWORD:-agromarket}"
DB_MONGO="${MONGO_DATABASE:-agromarket}"

log() { printf '[backup] %s\n' "$*"; }

asegurar_destino() {
  mkdir -p "$DESTINO"
  chmod 700 "$DESTINO"
}

# Restaura desde una copia. No sobrescribe sin confirmacion.
restaurar() {
  local archivo="${1:-}"
  if [[ -z "$archivo" || ! -f "$archivo" ]]; then
    log "uso: $0 --restaurar <archivo>"
    exit 1
  fi

  echo
  echo "  ESTA OPERACION REEMPLAZA LOS DATOS ACTUALES por los de:"
  echo "    $archivo"
  echo
  read -r -p "  Escribe RESTAURAR en mayusculas para continuar: " ok
  if [[ "$ok" != "RESTAURAR" ]]; then
    log "cancelado"
    exit 1
  fi

  if [[ "$archivo" == *.gz ]]; then
    log "restaurando MySQL desde $archivo"
    gunzip -c "$archivo" | docker exec -i "$C_MYSQL" \
      mysql -u"$USER_MYSQL" -p"$PASS_MYSQL" "$DB"
  else
    log "restaurando Mongo desde $archivo"
    gunzip -c "$archivo" | docker exec -i "$C_MONGO" \
      mongosh --quiet -u root -p"${MONGO_ROOT_PASSWORD:-}" \
      --authenticationDatabase admin "$DB_MONGO" --eval 'db.dropDatabase()' \
      >/dev/null
    gunzip -c "$archivo" | docker exec -i "$C_MONGO" \
      mongorestore --quiet --archive --gzip --db "$DB_MONGO" /dev/stdin
  fi
  log "restaurado"
}

backup_mysql() {
  local salida="$DESTINO/mysql-$FECHA.sql.gz"
  log "MySQL -> $salida"
  docker exec "$C_MYSQL" mysqldump \
    -u"$USER_MYSQL" -p"$PASS_MYSQL" \
    --single-transaction --quick --routines --triggers --events \
    "$DB" 2>/dev/null | gzip -9 > "$salida"
  chmod 600 "$salida"
  log "  $(du -h "$salida" | cut -f1)"
}

backup_mongo() {
  local salida="$DESTINO/mongo-$FECHA.archive.gz"
  log "Mongo -> $salida"
  docker exec "$C_MONGO" mongodump \
    --quiet --archive --gzip --db "$DB_MONGO" 2>/dev/null > "$salida"
  chmod 600 "$salida"
  log "  $(du -h "$salida" | cut -f1)"
}

purgar() {
  log "purgando copias de mas de $RETENCION_DIAS dias"
  find "$DESTINO" -type f \( -name 'mysql-*.sql.gz' -o -name 'mongo-*.archive.gz' \) \
    -mtime "+$RETENCION_DIAS" -print -delete
}

main() {
  asegurar_destino

  if [[ "${1:-}" == "--restaurar" ]]; then
    restaurar "${2:-}"
    return
  fi

  case "${1:-}" in
    --solo-mysql) backup_mysql ;;
    --solo-mongo) backup_mongo ;;
    *)            backup_mysql; backup_mongo ;;
  esac

  purgar
  log "listo. Para restaurar: $0 --restaurar <archivo>"
}

main "$@"