#!/bin/sh
set -e
if [ ! -f .env ]; then
  cp .env.example .env
fi
sync_env_to_dotenv() {
  _key="$1"
  _val="$2"
  if [ -z "$_val" ]; then
    return 0
  fi
  _esc_val=$(printf '%s' "$_val" | sed 's/[\/&]/\\&/g')
  if grep -q "^${_key}=" .env; then
    sed -i "s/^${_key}=.*/${_key}=${_esc_val}/" .env
  elif grep -q "^# *${_key}=" .env; then
    sed -i "s/^# *${_key}=.*/${_key}=${_esc_val}/" .env
  else
    printf '%s=%s\n' "$_key" "$_val" >> .env
  fi
}
# `php artisan serve` only forwards a small whitelist of env vars to the
# underlying `php -S` worker, so DB_* from compose never reaches web
# requests. Persist them into .env so CLI and web agree on the database.
sync_env_to_dotenv APP_URL "${APP_URL:-}"
sync_env_to_dotenv DB_CONNECTION "${DB_CONNECTION:-}"
sync_env_to_dotenv DB_DATABASE "${DB_DATABASE:-}"
DB_FILE="${DB_DATABASE:-database/database.sqlite}"
mkdir -p "$(dirname "$DB_FILE")"
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache || true
touch "$DB_FILE"
php artisan key:generate --force --no-interaction || true
php artisan storage:link --force || true
php artisan migrate --force
exec php artisan serve --host=0.0.0.0 --port=8000
