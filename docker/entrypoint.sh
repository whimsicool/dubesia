#!/bin/sh
set -e
if [ ! -f .env ]; then
  cp .env.example .env
fi
DB_FILE="${DB_DATABASE:-database/database.sqlite}"
mkdir -p "$(dirname "$DB_FILE")"
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache || true
touch "$DB_FILE"
php artisan key:generate --force --no-interaction || true
php artisan migrate --force
exec php artisan serve --host=0.0.0.0 --port=8000
