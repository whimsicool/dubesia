FROM node:22-bookworm-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY resources ./resources
COPY vite.config.js tailwind.config.js postcss.config.js jsconfig.json ./
COPY public ./public
RUN npm run build

FROM php:8.4-cli-bookworm
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl unzip sqlite3 \
    libsqlite3-dev libicu-dev libzip-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev libonig-dev libxml2-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_sqlite pdo_mysql bcmath intl zip pcntl opcache gd \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY composer.json composer.lock ./
COPY artisan ./artisan
COPY bootstrap ./bootstrap
COPY config ./config
COPY routes ./routes
COPY app ./app
COPY database ./database
COPY public ./public
COPY resources ./resources
COPY storage ./storage
COPY .env.example ./.env.example
RUN composer install --no-dev --no-interaction --no-progress --prefer-dist --optimize-autoloader
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache && chmod -R 775 storage bootstrap/cache
COPY --from=frontend /app/public/build ./public/build
COPY docker/php.ini /usr/local/etc/php/conf.d/uploads.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
EXPOSE 8000
ENTRYPOINT ["entrypoint.sh"]
