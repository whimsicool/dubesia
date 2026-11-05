#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

repo="${DUBESIA_REPO:-/home/ubuntu/dubesia}"
state="${DUBESIA_STATE_DIR:-/home/ubuntu/.local/share/dubesia}"
export DUBESIA_ENV_FILE="$repo/.env"
export DUBESIA_REPO="$repo"
mkdir -p "$state"
exec 9>"$state/deploy.lock"
flock -n 9 || { echo "Deployment lain masih berjalan." >&2; exit 1; }
test -s "$DUBESIA_ENV_FILE"
git -C "$repo" fetch origin main
latest="$(git -C "$repo" rev-parse FETCH_HEAD)"
revision="${1:-$latest}"
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo "SHA commit tidak valid." >&2; exit 1; }
if [[ "$revision" != "$latest" ]]; then
    echo "Commit sudah digantikan main terbaru; deployment ini dilewati."
    exit 0
fi

context="$(mktemp -d)"
trap 'rm -rf -- "$context"' EXIT
(umask 022; git -C "$repo" archive "$revision" | tar -x -C "$context")
export DUBESIA_IMAGE="dubesia:$revision"
docker volume inspect dubesia_db-data dubesia_app-storage >/dev/null
docker compose --env-file "$DUBESIA_ENV_FILE" -f "$context/compose.production.yaml" config --quiet
docker build -f "$context/Dockerfile.production" -t "$DUBESIA_IMAGE" "$context"

manifest="$state/compose.yaml"
previous_image=""
test ! -f "$state/current-image" || previous_image="$(cat "$state/current-image")"
test ! -f "$manifest" || cp "$manifest" "$context/previous-compose.yaml"
maintenance=false

compose() {
    docker compose --env-file "$DUBESIA_ENV_FILE" -f "$manifest" "$@"
}

recover() {
    result=$?
    trap - ERR
    echo "Deployment gagal. Skema database tidak di-rollback otomatis." >&2
    if [[ -n "$previous_image" && -f "$context/previous-compose.yaml" ]]; then
        cp "$context/previous-compose.yaml" "$manifest"
        export DUBESIA_IMAGE="$previous_image"
        compose up -d --no-deps --force-recreate app queue scheduler || true
    else
        for service in queue scheduler; do
            docker stop --time 90 "dubesia-$service-1" >/dev/null 2>&1 || true
        done
        if [[ -f "$repo/compose.vps.yaml" ]]; then
            docker compose --env-file "$DUBESIA_ENV_FILE" -f "$repo/compose.vps.yaml" up -d --no-deps --force-recreate app || true
        fi
    fi
    if $maintenance; then
        docker exec dubesia-app-1 php artisan up || true
    fi
    exit "$result"
}
trap recover ERR

docker exec dubesia-app-1 php artisan down --retry=60
maintenance=true
for service in queue scheduler; do
    if docker container inspect "dubesia-$service-1" >/dev/null 2>&1; then
        docker stop --time 90 "dubesia-$service-1"
    fi
done
bash "$context/docker/production/backup.sh"
cp "$context/compose.production.yaml" "$manifest"
compose config --quiet
compose run --rm --no-deps app php artisan migrate --force --no-interaction
compose up -d --no-deps --force-recreate app queue scheduler
compose exec -T app php artisan up

healthy=false
for attempt in $(seq 1 30); do
    if curl --fail --silent --output /dev/null http://127.0.0.1:8000/up; then
        healthy=true
        break
    fi
    sleep 2
done
$healthy || { echo "Health check gagal." >&2; false; }
curl --fail --silent --output /dev/null https://dubesia.web.id/up
printf '%s\n' "$DUBESIA_IMAGE" > "$state/current-image"
printf '%s\n' "$revision" > "$state/current-sha"
maintenance=false
trap - ERR
echo "Deployment berhasil: $revision"
