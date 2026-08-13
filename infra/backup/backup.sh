#!/usr/bin/env bash
# Simple MySQL backup script that writes to stdout (redirect where needed)
set -euo pipefail

HOST=${DB_HOST:-localhost}
PORT=${DB_PORT:-33060}
DB=${DB_NAME:-agromarket_db}
USER=${DB_USERNAME:-agromarket_user}
PASS=${DB_PASSWORD:-}

TS=$(date +%Y%m%dT%H%M%S)
OUTFILE="/backups/${DB}-${TS}.sql.gz"

mkdir -p /backups
echo "Backing up $DB to $OUTFILE"
mysqldump -h "$HOST" -P "$PORT" -u "$USER" -p"$PASS" "$DB" | gzip > "$OUTFILE"
echo "Backup saved: $OUTFILE"
