#!/bin/sh
set -eu

test -s /run/dubesia.env || { echo "Konfigurasi /run/dubesia.env tidak tersedia." >&2; exit 1; }
cp /run/dubesia.env /app/.env
chown root:www-data /app/.env
chmod 640 /app/.env
grep -q '^APP_KEY=base64:.' /app/.env || { echo "APP_KEY belum diisi. Buat sekali di .env VPS." >&2; exit 1; }
mkdir -p storage/app/public storage/app/private storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
rm -f bootstrap/cache/config.php public/hot
php artisan storage:link --force --no-interaction

if [ "$1" = "/usr/bin/supervisord" ]; then
    exec "$@"
fi
exec gosu www-data "$@"
