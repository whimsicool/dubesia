#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

repo="${DUBESIA_REPO:-/home/ubuntu/dubesia}"
destination="${DUBESIA_BACKUP_DIR:-/home/ubuntu/dubesia-backups}"
mkdir -p "$destination"
exec 8>"$destination/backup.lock"
flock -n 8 || { echo "Backup lain masih berjalan." >&2; exit 1; }
snapshot="$destination/$(date -u +%Y%m%dT%H%M%S)-$$"
mkdir "$snapshot"
cp "$repo/.env" "$snapshot/app.env"

docker exec dubesia-db-1 sh -ec '
  export MYSQL_PWD="$MARIADB_PASSWORD"
  exec mariadb-dump --user="$MARIADB_USER" --single-transaction --quick --skip-lock-tables --no-tablespaces "$MARIADB_DATABASE"
' | gzip > "$snapshot/database.sql.gz"
gzip -t "$snapshot/database.sql.gz"
docker exec dubesia-app-1 tar -C /app/storage -czf - app > "$snapshot/uploads.tar.gz"
tar -tzf "$snapshot/uploads.tar.gz" > /dev/null
touch "$snapshot/COMPLETE"
printf 'Backup tersimpan: %s\n' "$snapshot"
