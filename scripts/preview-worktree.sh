#!/usr/bin/env bash
#
# preview-worktree.sh — serve any Dubesia Git worktree on its own local port.
#
# The script prepares a worktree that Git created without local artifacts
# (.env, vendor, node_modules, public/build, storage links) and runs
# `php artisan serve` for it. Runtime state, PID files, and logs stay in
# /tmp/dubesia-preview-<slug>/ and never inside the worktree.
#
# Usage:
#   scripts/preview-worktree.sh start  --path <abs-worktree> [--port <port>]
#                                      [--dev] [--db-copy [--db-copy-fresh]]
#                                      [--force-env] [--main <abs-checkout>]
#   scripts/preview-worktree.sh stop   --path <abs-worktree>
#   scripts/preview-worktree.sh status [--path <abs-worktree>]
#   scripts/preview-worktree.sh help
#
# Exit codes: 0 success, 1 failure, 2 usage error.

set -euo pipefail

PROG=$(basename "$0")
READY_URL=
STATE_DIR=
DEFAULT_PORT=8003
MAX_PORT=65535
STOP_TICKS=50 # 50 * 0.1 s = 5 s grace period before SIGKILL

# The main app is served on port 8002. No preview may take it.
FIXED_PROTECTED_PORTS=(8002)
EXTRA_PROTECTED_PORTS=()

# --- output -----------------------------------------------------------------

say() { printf '==> %s\n' "$*"; }
step() { printf '[%-8s] %s\n' "$1" "$2"; }
warn() { printf 'WARN: %s\n' "$*" >&2; }
die() {
    printf 'ERROR: %s\n' "$*" >&2
    exit 1
}

usage() {
    cat <<EOF
$PROG — serve a Dubesia Git worktree on its own local port.

Usage:
  $PROG start  --path <abs-worktree> [options]
  $PROG stop   --path <abs-worktree>
  $PROG status [--path <abs-worktree>]
  $PROG help

Start options:
  --path <dir>        Absolute path of the worktree root (the directory
                      that holds artisan and composer.json).
  --port <port>       Preferred port. Default: $DEFAULT_PORT. If the port is
                      busy, the next free port is used. Port 8002 is never
                      used.
  --dev               Run the Vite dev server instead of a production build.
  --db-copy           Copy the main database to <name>_preview_<slug> and
                      point this preview at the copy. Local MariaDB/MySQL
                      only. Off by default: sharing the main database is the
                      default.
  --db-copy-fresh     With --db-copy, drop the existing preview database
                      before copying.
  --force-env         Overwrite the worktree .env with the main .env. Without
                      this flag an existing .env is kept, including its DB
                      credentials. Use this flag when a kept .env cannot reach
                      the database.
  --main <dir>        Main checkout to copy .env, node_modules, and the
                      database from. Default: the first entry of
                      \`git worktree list\`, or \$DUBESIA_MAIN.

Examples:
  $PROG start --path /home/nabila/Documents/Projects/dubesia --port 8003
  $PROG start --path /tmp/dubesia-fix --port 8004 --db-copy
  $PROG start --path /tmp/dubesia-fix --port 8005 --dev
  $PROG stop  --path /tmp/dubesia-fix
  $PROG status

Runtime files: /tmp/dubesia-preview-<slug>/ (pid, meta, serve.log, vite.log).
EOF
}

# --- small helpers ----------------------------------------------------------

need_cmd() {
    command -v "$1" >/dev/null 2>&1 || die "required command not found: $1"
}

absolute_path() {
    realpath -m -- "$1"
}

slug_for() {
    local path=$1 base hash
    base=$(basename "$path" | tr -cs 'A-Za-z0-9._-' '-' | sed -E 's/^-+//; s/-+$//' | cut -c1-28)
    hash=$(printf '%s' "$path" | md5sum | cut -c1-8)
    printf '%s-%s\n' "${base:-worktree}" "$hash"
}

state_dir_for() {
    printf '/tmp/dubesia-preview-%s\n' "$(slug_for "$1")"
}

port_in_use() {
    local port=$1
    if command -v ss >/dev/null 2>&1; then
        [[ -n $(ss -ltnH "sport = :${port}" 2>/dev/null) ]]
    else
        (exec 3<>"/dev/tcp/127.0.0.1/${port}") 2>/dev/null
    fi
}

port_listener_pids() {
    local port=$1
    command -v ss >/dev/null 2>&1 || return 0
    ss -ltnpH "sport = :${port}" 2>/dev/null | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u
}

env_value() { # <file> <key>
    local file=$1 key=$2 line value
    [[ -f $file ]] || return 0
    line=$(grep -m1 -E "^[[:space:]]*${key}=" "$file" 2>/dev/null || true)
    [[ -n $line ]] || return 0
    value=${line#*=}
    value=${value%$'\r'}
    if [[ $value == \"*\" || $value == \'*\' ]]; then
        value=${value:1:${#value}-2}
    fi
    printf '%s' "$value"
}

env_set() { # <file> <key> <value>
    local file=$1 key=$2 value=$3 tmp
    tmp="${STATE_DIR:-$(dirname "$file")}/env.tmp"
    if grep -qE "^[[:space:]]*${key}=" "$file" 2>/dev/null; then
        awk -v k="$key" -v v="$value" '
            $0 ~ "^[[:space:]]*" k "=" { if (!seen) { print k "=" v; seen = 1 } ; next }
            { print }
        ' "$file" >"$tmp"
        mv -- "$tmp" "$file"
    else
        if [[ -s $file && -n $(tail -c1 "$file") ]]; then
            printf '\n' >>"$file"
        fi
        printf '%s=%s\n' "$key" "$value" >>"$file"
    fi
}

pid_alive() {
    [[ -n ${1:-} ]] && kill -0 "$1" 2>/dev/null
}

pid_owned_by() { # <pid> <worktree-path> <cmdline-pattern>
    local pid=$1 path=$2 pattern=$3 cwd
    pid_alive "$pid" || return 1
    cwd=$(readlink "/proc/${pid}/cwd" 2>/dev/null || true)
    [[ $cwd == "$path" ]] || return 1
    tr '\0' ' ' <"/proc/${pid}/cmdline" 2>/dev/null | grep -q -- "$pattern"
}

meta_get() { # <state-dir> <key>
    local file="$1/meta"
    [[ -f $file ]] || return 0
    sed -n "s/^$2=//p" "$file" | head -1
}

main_checkout_for() { # <worktree-path>
    local path=$1
    if [[ -n ${MAIN_OVERRIDE:-} ]]; then
        printf '%s\n' "$(absolute_path "$MAIN_OVERRIDE")"
        return 0
    fi
    git -C "$path" worktree list --porcelain 2>/dev/null |
        awk '/^worktree / { print substr($0, 10); exit }'
}

is_protected_port() {
    local port=$1 p
    for p in "${FIXED_PROTECTED_PORTS[@]}" "${EXTRA_PROTECTED_PORTS[@]}"; do
        [[ -n $p && $port == "$p" ]] && return 0
    done
    return 1
}

free_port_from() { # <start-port>
    local port=$1 i
    for ((i = 0; i < 60; i++)); do
        ((port > MAX_PORT)) && port=$DEFAULT_PORT
        if ! is_protected_port "$port" && ! port_in_use "$port"; then
            printf '%s\n' "$port"
            return 0
        fi
        port=$((port + 1))
    done
    return 1
}

# --- argument parsing -------------------------------------------------------

COMMAND=${1:-help}
[[ $# -gt 0 ]] && shift

PATH_ARG=
PORT_ARG=
MAIN_OVERRIDE=${DUBESIA_MAIN:-}
FORCE_ENV=0
DEV_MODE=0
DB_COPY=0
DB_COPY_FRESH=0

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --path)
                [[ $# -ge 2 ]] || { usage >&2; die "--path needs a value"; }
                PATH_ARG=$2
                shift 2
                ;;
            --port)
                [[ $# -ge 2 ]] || { usage >&2; die "--port needs a value"; }
                PORT_ARG=$2
                shift 2
                ;;
            --main)
                [[ $# -ge 2 ]] || { usage >&2; die "--main needs a value"; }
                MAIN_OVERRIDE=$2
                shift 2
                ;;
            --dev) DEV_MODE=1 && shift ;;
            --db-copy) DB_COPY=1 && shift ;;
            --db-copy-fresh) DB_COPY=1 && DB_COPY_FRESH=1 && shift ;;
            --force-env) FORCE_ENV=1 && shift ;;
            -h | --help) usage && exit 0 ;;
            *) usage >&2 && die "unknown argument: $1" ;;
        esac
    done
}

validate_path_arg() { # <mode>
    local mode=$1
    [[ -n $PATH_ARG ]] || { usage >&2 && die "--path is required"; }
    [[ $PATH_ARG == /* ]] || die "--path must be absolute: $PATH_ARG"
    PATH_ARG=$(absolute_path "$PATH_ARG")
    if [[ $mode == start ]]; then
        [[ -d $PATH_ARG ]] || die "worktree not found: $PATH_ARG"
        [[ -f $PATH_ARG/artisan && -f $PATH_ARG/composer.json ]] ||
            die "not a Laravel worktree root (artisan or composer.json missing): $PATH_ARG"
        local top
        top=$(git -C "$PATH_ARG" rev-parse --show-toplevel 2>/dev/null || true)
        [[ -n $top ]] || die "not a Git worktree: $PATH_ARG"
        [[ $(absolute_path "$top") == "$PATH_ARG" ]] ||
            die "--path must be the worktree root, not a subdirectory: ${top}"
    fi
}

validate_port_arg() {
    [[ -n $PORT_ARG ]] || return 0
    [[ $PORT_ARG =~ ^[0-9]+$ ]] || die "--port must be a number: $PORT_ARG"
    ((PORT_ARG >= 1024 && PORT_ARG <= MAX_PORT)) || die "--port out of range (1024-${MAX_PORT}): $PORT_ARG"
    if is_protected_port "$PORT_ARG"; then
        die "port ${PORT_ARG} is reserved for the main app and is never used by a preview"
    fi
}

# --- environment ------------------------------------------------------------

ensure_env() { # <worktree> <main> <port>
    local path=$1 main=$2 port=$3 env_file="$1/.env"

    if [[ ! -f $main/.env ]]; then
        die "main checkout has no .env to copy: ${main}/.env"
    fi

    if [[ -f $env_file && $FORCE_ENV -eq 0 ]]; then
        step env "kept existing .env"
    else
        if [[ -f $env_file ]]; then
            cp -- "$env_file" "${env_file}.backup" && step env "backed up .env to .env.backup"
        fi
        cp -- "$main/.env" "$env_file"
        chmod 600 "$env_file"
        step env "copied .env from ${main}"
    fi

    env_set "$env_file" APP_URL "http://127.0.0.1:${port}"
    env_set "$env_file" SESSION_COOKIE "dubesia_preview_${port}"
    env_set "$env_file" CACHE_PREFIX "dubesia_preview_${port}"
    step env "APP_URL=http://127.0.0.1:${port}, SESSION_COOKIE and CACHE_PREFIX set for this preview"
}

ensure_app_key() { # <worktree>
    local path=$1 key
    key=$(env_value "$path/.env" APP_KEY)
    if [[ -z $key ]]; then
        (cd "$path" && php artisan key:generate --force >/dev/null 2>&1) ||
            die "could not generate APP_KEY in $path"
        step env "generated APP_KEY"
    fi
}

ensure_dependencies() { # <worktree> <main> <state>
    local path=$1 main=$2 state=$3

    if [[ ! -d $path/vendor ]]; then
        need_cmd composer
        step deps "vendor missing; running composer install (first run only)"
        if ! (cd "$path" && composer install --no-interaction --prefer-dist) >"$state/deps.log" 2>&1; then
            tail -20 "$state/deps.log" >&2
            die "composer install failed; full log: $state/deps.log"
        fi
        step deps "composer install finished"
    else
        step deps "vendor present"
    fi

    if [[ ! -d $path/node_modules && ! -L $path/node_modules ]]; then
        if [[ -d $main/node_modules ]]; then
            ln -s "$main/node_modules" "$path/node_modules"
            step deps "node_modules linked to ${main}/node_modules"
        else
            need_cmd npm
            step deps "node_modules missing in main checkout; running npm install in the worktree"
            if ! (cd "$path" && npm install --no-audit --no-fund) >"$state/deps.log" 2>&1; then
                tail -20 "$state/deps.log" >&2
                die "npm install failed; full log: $state/deps.log"
            fi
            step deps "npm install finished"
        fi
    else
        step deps "node_modules present"
    fi
}

ensure_storage() { # <worktree>
    local path=$1
    mkdir -p "$path/storage/app/public" \
        "$path/storage/framework/cache/data" \
        "$path/storage/framework/sessions" \
        "$path/storage/framework/testing" \
        "$path/storage/framework/views" \
        "$path/storage/logs" \
        "$path/bootstrap/cache"
    if [[ -e $path/public/storage || -L $path/public/storage ]]; then
        step storage "public/storage link present"
    else
        (cd "$path" && php artisan storage:link >/dev/null 2>&1) ||
            die "php artisan storage:link failed in $path"
        step storage "created public/storage link"
    fi
}

assets_are_stale() { # <worktree>
    local path=$1 manifest="$1/public/build/manifest.json"
    [[ -f $manifest ]] || return 0
    find "$path/resources/js" "$path/resources/css" "$path/vite.config.js" \
        "$path/tailwind.config.js" "$path/postcss.config.js" "$path/package.json" \
        -type f -newer "$manifest" -print -quit 2>/dev/null | grep -q .
}

ensure_assets() { # <worktree> <state>
    local path=$1 state=$2 started
    if [[ -f $path/public/hot ]]; then
        warn "removed stale public/hot (no Vite dev server was running)"
        rm -f "$path/public/hot"
    fi
    if assets_are_stale "$path"; then
        need_cmd npm
        step assets "building frontend (resources newer than public/build)"
        started=$(date +%s)
        if ! (cd "$path" && npm run build) >"$state/build.log" 2>&1; then
            tail -20 "$state/build.log" >&2
            die "npm run build failed; full log: $state/build.log"
        fi
        step assets "build finished in $(( $(date +%s) - started ))s"
    else
        step assets "public/build is up to date"
    fi
}

clear_config_cache() { # <worktree>
    local path=$1
    if [[ -f $path/bootstrap/cache/config.php ]]; then
        (cd "$path" && php artisan config:clear >/dev/null 2>&1) ||
            die "config:clear failed in $path"
        step env "cleared cached config so .env values apply"
    fi
}

db_env_diff() { # <worktree-env> <main-env> -> names of keys that differ
    local worktree_env=$1 main_env=$2 key mine theirs diff=()
    for key in DB_CONNECTION DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD; do
        mine=$(env_value "$worktree_env" "$key")
        theirs=$(env_value "$main_env" "$key")
        [[ $mine == "$theirs" ]] || diff+=("$key")
    done
    ((${#diff[@]})) && printf '%s' "${diff[*]}"
    return 0
}

check_database() { # <worktree> <main> <state>
    local path=$1 main=$2 state=$3 out line diff
    if (cd "$path" && php artisan db:show --no-interaction) >"$state/db-check.log" 2>&1; then
        step db "connection ok ($(env_value "$path/.env" DB_DATABASE) at $(env_value "$path/.env" DB_HOST):$(env_value "$path/.env" DB_PORT))"
        return 0
    fi
    out=$(cat "$state/db-check.log")
    line=$(grep -m1 -E 'SQLSTATE' <<<"$out" | sed -E 's/^[[:space:]]+//')
    [[ -n $line ]] || line=$(grep -m1 -E 'PDOException|Unknown database|Connection refused|getaddrinfo' <<<"$out" | sed -E 's/^[[:space:]]+//')
    {
        printf 'ERROR: the app cannot reach its database from this worktree.\n'
        printf '  target: %s at %s:%s as %s\n' \
            "$(env_value "$path/.env" DB_DATABASE)" \
            "$(env_value "$path/.env" DB_HOST)" \
            "$(env_value "$path/.env" DB_PORT)" \
            "$(env_value "$path/.env" DB_USERNAME)"
        [[ -n $line ]] && printf '  driver: %s\n' "$line"
        diff=$(db_env_diff "$path/.env" "$main/.env")
        if [[ -n $diff ]]; then
            printf '  this .env differs from the main checkout in: %s\n' "$diff"
            printf '  start keeps an existing .env; rerun with --force-env to copy the main .env (saved as .env.backup)\n'
        fi
        printf '  check log: %s/db-check.log\n' "$state"
    } >&2
    exit 1
}

app_error_hint() { # <worktree> -> last logged application error
    local log="$1/storage/logs/laravel.log"
    [[ -f $log ]] || return 0
    grep -a 'local.ERROR' "$log" 2>/dev/null | tail -1 | cut -c1-320
}

# --- database copy ----------------------------------------------------------

pick_db_client() {
    local client dump
    for client in mariadb mysql; do
        command -v "$client" >/dev/null 2>&1 || continue
        if ! "$client" --defaults-extra-file="$DB_CNF" --protocol=TCP \
            -e 'SELECT 1' >/dev/null 2>&1; then
            continue
        fi
        case $client in
            mariadb) dump=mariadb-dump ;;
            *) dump=mysqldump ;;
        esac
        command -v "$dump" >/dev/null 2>&1 || continue
        DB_CLIENT=$client
        DB_DUMP=$dump
        return 0
    done
    return 1
}

db_copy() { # <worktree> <state> <slug>
    local path=$1 state=$2 slug=$3 env_file="$1/.env"
    local connection host port db user
    local DB_PASSWORD=

    connection=$(env_value "$env_file" DB_CONNECTION)
    host=$(env_value "$env_file" DB_HOST)
    port=$(env_value "$env_file" DB_PORT)
    db=$(env_value "$env_file" DB_DATABASE)
    user=$(env_value "$env_file" DB_USERNAME)
    DB_PASSWORD=$(env_value "$env_file" DB_PASSWORD)
    port=${port:-3306}

    case $connection in
        mariadb | mysql) ;;
        *) die "--db-copy supports MariaDB/MySQL only (DB_CONNECTION=${connection:-unset})" ;;
    esac
    case $host in
        127.0.0.1 | localhost | ::1) ;;
        *) die "--db-copy refuses a non-local DB_HOST ($host); use the default shared database instead" ;;
    esac
    [[ $(env_value "$env_file" APP_ENV) == production ]] &&
        die "--db-copy refuses APP_ENV=production"

    [[ -n $db && -n $user ]] || die "DB_DATABASE or DB_USERNAME missing in $env_file"

    local target
    target="${db}_preview_${slug//-/_}"
    if ((${#target} > 64)); then
        die "preview database name too long (${#target} chars, max 64): $target"
    fi

    DB_CNF="$state/mysql.cnf"
    local pw=${DB_PASSWORD//\\/\\\\}
    pw=${pw//\"/\\\"}
    (
        umask 077
        {
            printf '[client]\n'
            printf 'host=%s\n' "$host"
            printf 'port=%s\n' "$port"
            printf 'user=%s\n' "$user"
            printf 'password="%s"\n' "$pw"
        } >"$DB_CNF"
    )
    DB_CLIENT=
    DB_DUMP=
    pick_db_client || {
        rm -f "$DB_CNF"
        die "no working MariaDB/MySQL client found (tried mariadb and mysql); skipping --db-copy"
    }

    local exists
    exists=$("$DB_CLIENT" --defaults-extra-file="$DB_CNF" --protocol=TCP -N -B \
        -e "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = '$target'" 2>/dev/null || true)

    if [[ $exists == "1" && $DB_COPY_FRESH -eq 0 ]]; then
        step db "reusing existing copy ${target} (pass --db-copy-fresh to recreate)"
    else
        if [[ $exists == "1" ]]; then
            "$DB_CLIENT" --defaults-extra-file="$DB_CNF" --protocol=TCP \
                -e "DROP DATABASE \`${target}\`" ||
                { rm -f "$DB_CNF"; die "could not drop ${target}"; }
            step db "dropped old copy ${target}"
        fi
        step db "copying ${db} to ${target} from ${host}:${port}"
        "$DB_CLIENT" --defaults-extra-file="$DB_CNF" --protocol=TCP \
            -e "CREATE DATABASE \`${target}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci" ||
            { rm -f "$DB_CNF"; die "could not create ${target}"; }
        if ! "$DB_DUMP" --defaults-extra-file="$DB_CNF" --protocol=TCP \
            --single-transaction --quick --skip-lock-tables --no-tablespaces --triggers \
            "$db" | "$DB_CLIENT" --defaults-extra-file="$DB_CNF" --protocol=TCP "$target" \
            >"$state/db-copy.log" 2>&1; then
            rm -f "$DB_CNF"
            die "database copy failed; full log: $state/db-copy.log"
        fi
        step db "copied to ${target}"
    fi

    rm -f "$DB_CNF"
    env_set "$env_file" DB_DATABASE "$target"
    step db "DB_DATABASE=${target} for this preview only"
}

# --- process control --------------------------------------------------------

start_detached() { # <pidfile> <log> <cwd> <cmd...>
    local pidfile=$1 log=$2 cwd=$3
    shift 3
    rm -f "$pidfile"
    (
        cd "$cwd" || exit 1
        exec setsid --fork bash -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" "$@"
    ) >>"$log" 2>&1
    local i
    for ((i = 0; i < 40; i++)); do
        [[ -s $pidfile ]] && return 0
        sleep 0.05
    done
    return 0
}

stop_group() { # <pidfile> <worktree> <cmdline-pattern> <label>
    local pidfile=$1 path=$2 pattern=$3 label=$4 pid
    [[ -f $pidfile ]] || return 0
    pid=$(cat "$pidfile" 2>/dev/null || true)
    rm -f "$pidfile"
    [[ -n $pid ]] || return 0
    if ! pid_alive "$pid"; then
        return 0
    fi
    if ! pid_owned_by "$pid" "$path" "$pattern"; then
        warn "${label} pid ${pid} does not belong to ${path}; left running"
        return 0
    fi
    kill -TERM -- "-${pid}" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
    local i
    for ((i = 0; i < STOP_TICKS; i++)); do
        pid_alive "$pid" || break
        sleep 0.1
    done
    if pid_alive "$pid"; then
        kill -KILL -- "-${pid}" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
        sleep 0.2
    fi
    step stop "${label} stopped (pid ${pid})"
}

release_port() { # <port> <worktree>
    local port=$1 path=$2 pid cwd
    if is_protected_port "$port"; then
        warn "port ${port} is reserved for the main app; left untouched"
        return 0
    fi
    port_in_use "$port" || return 0
    for pid in $(port_listener_pids "$port"); do
        cwd=$(readlink "/proc/${pid}/cwd" 2>/dev/null || true)
        if [[ $cwd == "$path" ]]; then
            warn "port ${port} still held by pid ${pid} from this worktree; stopping it"
            kill -TERM "$pid" 2>/dev/null || true
            sleep 0.5
            kill -KILL "$pid" 2>/dev/null || true
        fi
    done
    sleep 0.2
    port_in_use "$port" && warn "port ${port} is still in use by another process"
    return 0
}

wait_for_http() { # <port> <limit-seconds> <pid>; returns 2 when the app answers 5xx
    local port=$1 limit=$2 pid=$3 i code url errors=0 saw_5xx
    for ((i = 0; i < limit; i++)); do
        saw_5xx=0
        for url in "/login" "/"; do
            code=$(curl -sS -o /dev/null -m 3 -w '%{http_code}' "http://127.0.0.1:${port}${url}" 2>/dev/null || true)
            if [[ $code =~ ^[23][0-9][0-9]$ ]]; then
                READY_URL="http://127.0.0.1:${port}${url}"
                return 0
            fi
            [[ $code == 5* ]] && saw_5xx=1
        done
        if [[ $saw_5xx -eq 1 ]]; then
            errors=$((errors + 1))
            ((errors >= 4)) && return 2
        else
            errors=0
        fi
        pid_alive "$pid" || return 1
        sleep 1
    done
    return 1
}

# --- commands ---------------------------------------------------------------

cmd_start() {
    parse_args "$@"
    validate_path_arg start

    local path=$PATH_ARG state main read_only=0
    main=$(main_checkout_for "$path")
    [[ -n $main ]] || die "cannot find the main checkout; pass --main <dir>"
    [[ -d $main ]] || die "main checkout not found: $main"
    [[ $path == "$main" ]] && read_only=1

    EXTRA_PROTECTED_PORTS=()
    local main_port
    main_port=$(env_value "$main/.env" APP_URL | sed -nE 's#.*:([0-9]+)/?$#\1#p')
    [[ -n $main_port ]] && EXTRA_PROTECTED_PORTS+=("$main_port")

    validate_port_arg

    state=$(state_dir_for "$path")
    STATE_DIR=$state
    mkdir -p "$state"

    local serving_port
    serving_port=$(meta_get "$state" PORT)
    local serving_pid
    serving_pid=$(cat "$state/server.pid" 2>/dev/null || true)
    if pid_owned_by "$serving_pid" "$path" 'artisan serve'; then
        if [[ -n $PORT_ARG && $PORT_ARG != "$serving_port" ]]; then
            die "this worktree is already running on port ${serving_port}; stop it before starting on ${PORT_ARG}"
        fi
        say "already running: http://127.0.0.1:${serving_port} (pid ${serving_pid})"
        say "log: ${state}/serve.log"
        return 0
    fi
    rm -f "$state/server.pid" "$state/vite.pid"

    local port
    if [[ -n $PORT_ARG ]]; then
        port=$PORT_ARG
        if port_in_use "$port"; then
            local fallback
            fallback=$(free_port_from $((port + 1))) || die "no free port found near ${port}"
            warn "port ${port} is busy; using port ${fallback} instead"
            port=$fallback
        fi
    else
        port=$(free_port_from "$DEFAULT_PORT") || die "no free port found from ${DEFAULT_PORT}"
    fi

    say "worktree ${path}"
    [[ $read_only -eq 1 ]] && say "read-only mode: the main checkout is never modified"

    (
        printf 'WORKTREE=%s\n' "$path"
        printf 'MAIN=%s\n' "$main"
        printf 'PORT=%s\n' "$port"
        printf 'MODE=%s\n' "$([[ $DEV_MODE -eq 1 ]] && echo dev || echo build)"
        printf 'STARTED=%s\n' "$(date -Iseconds)"
    ) >"$state/meta"

    : >"$state/serve.log"
    : >"$state/build.log"
    : >"$state/deps.log"

    need_cmd php
    need_cmd curl

    if [[ $read_only -eq 1 ]]; then
        [[ -f $path/vendor/autoload.php ]] || die "main checkout has no vendor directory; run composer install there first"
        [[ -f $path/public/build/manifest.json ]] || die "main checkout has no public/build; run npm run build there first"
        step env "left the main .env untouched (overrides passed to the server process)"
    else
        ensure_env "$path" "$main" "$port"
        ensure_dependencies "$path" "$main" "$state"
        ensure_app_key "$path"
        check_database "$path" "$main" "$state"
        [[ $DB_COPY -eq 1 ]] && db_copy "$path" "$state" "$(slug_for "$path")"
        ensure_storage "$path"
        clear_config_cache "$path"
        if [[ $DEV_MODE -eq 1 ]]; then
            : # Vite is started below.
            step assets "dev mode: skipping the production build"
        else
            ensure_assets "$path" "$state"
        fi
    fi

    local app_url="http://127.0.0.1:${port}"
    local env_args=(APP_URL="$app_url" SESSION_COOKIE="dubesia_preview_${port}" CACHE_PREFIX="dubesia_preview_${port}")

    local vite_pid=
    if [[ $DEV_MODE -eq 1 ]]; then
        need_cmd npm
        local vite_port
        vite_port=$(free_port_from $((port + 1000))) || die "no free port for the Vite dev server"
        : >"$state/vite.log"
        start_detached "$state/vite.pid" "$state/vite.log" "$path" \
            env "${env_args[@]}" npm run dev -- --host 127.0.0.1 --port "$vite_port" --strictPort
        vite_pid=$(cat "$state/vite.pid" 2>/dev/null || true)
        local i
        for ((i = 0; i < 40; i++)); do
            [[ -f $path/public/hot ]] && break
            pid_alive "$vite_pid" || break
            sleep 0.5
        done
        if [[ -f $path/public/hot ]]; then
            step assets "Vite dev server on port ${vite_port} (public/hot written)"
        else
            pid_alive "$vite_pid" || die "Vite dev server exited; log: ${state}/vite.log"
            printf 'http://127.0.0.1:%s\n' "$vite_port" >"$path/public/hot"
            warn "Vite did not write public/hot; wrote http://127.0.0.1:${vite_port} manually"
        fi
    fi

    start_detached "$state/server.pid" "$state/serve.log" "$path" \
        env "${env_args[@]}" php artisan serve --host=0.0.0.0 --port="$port"
    local server_pid
    server_pid=$(cat "$state/server.pid" 2>/dev/null || true)
    sleep 0.5
    pid_alive "$server_pid" || {
        tail -20 "$state/serve.log" >&2
        die "php artisan serve exited immediately; log: ${state}/serve.log"
    }

    local ready=0
    wait_for_http "$port" 30 "$server_pid" || ready=$?
    if [[ $ready -ne 0 ]]; then
        local hint
        hint=$(app_error_hint "$path")
        [[ -n $hint ]] && printf 'last application error: %s\n' "$hint" >&2
        tail -8 "$state/serve.log" >&2
        stop_group "$state/server.pid" "$path" 'artisan serve' "server"
        [[ -n $vite_pid ]] && stop_group "$state/vite.pid" "$path" 'run dev\|vite' "vite"
        if [[ $ready -eq 2 ]]; then
            die "the server answers HTTP 500 on port ${port}; fix the error above, then start again"
        fi
        die "not serving HTTP on port ${port}; log: ${state}/serve.log"
    fi

    printf 'URL=%s\n' "$READY_URL" >>"$state/meta"
    printf 'PID=%s\n' "$server_pid" >>"$state/meta"
    printf 'VITE_PID=%s\n' "${vite_pid:-}" >>"$state/meta"

    local db_mode
    if [[ $read_only -eq 1 ]]; then
        db_mode="shared $(env_value "$path/.env" DB_DATABASE) (read-only checkout)"
    else
        db_mode=$(env_value "$path/.env" DB_DATABASE)
    fi

    echo
    say "ready: ${READY_URL}"
    say "database: ${db_mode}"
    if [[ $DB_COPY -eq 1 && $read_only -eq 0 ]]; then
        say "database copy: this preview writes to its own copy"
    else
        say "data is shared with the main app and with other previews"
    fi
    say "stop: ${PROG} stop --path ${path}"
    say "log: ${state}/serve.log"
}

cmd_stop() {
    parse_args "$@"
    validate_path_arg stop
    local path=$PATH_ARG state
    state=$(state_dir_for "$path")

    if [[ ! -d $state ]]; then
        say "no preview state for ${path}"
        return 0
    fi

    local port
    port=$(meta_get "$state" PORT)
    local vite_pid
    vite_pid=$(cat "$state/vite.pid" 2>/dev/null || true)

    if [[ -f $path/public/hot ]]; then
        rm -f "$path/public/hot"
        step stop "removed public/hot"
    fi

    stop_group "$state/vite.pid" "$path" 'run dev\|vite' "vite"
    stop_group "$state/server.pid" "$path" 'artisan serve' "server"

    [[ -n $port ]] && release_port "$port" "$path"

    rm -f "$state/server.pid" "$state/vite.pid"
    sed -i '/^URL=/d; /^PID=/d; /^VITE_PID=/d' "$state/meta" 2>/dev/null || true

    if [[ -n $port ]]; then
        if port_in_use "$port"; then
            warn "port ${port} is still in use by another process"
            return 1
        fi
        step stop "port ${port} released"
    fi
    say "stopped ${path}"
    say "log kept at ${state}/serve.log"
}

cmd_status() {
    parse_args "$@"
    local dirs=()
    if [[ -n $PATH_ARG ]]; then
        validate_path_arg status
        dirs=("$(state_dir_for "$PATH_ARG")")
    else
        shopt -s nullglob
        dirs=(/tmp/dubesia-preview-*)
        shopt -u nullglob
    fi

    if [[ ${#dirs[@]} -eq 0 ]]; then
        say "no previews recorded"
        return 0
    fi

    local dir path port pid url status_line shown=0
    for dir in "${dirs[@]}"; do
        if [[ ! -f $dir/meta ]]; then
            [[ -n $PATH_ARG ]] && say "no preview state for ${PATH_ARG}"
            continue
        fi
        shown=$((shown + 1))
        path=$(meta_get "$dir" WORKTREE)
        port=$(meta_get "$dir" PORT)
        pid=$(cat "$dir/server.pid" 2>/dev/null || true)
        url=$(meta_get "$dir" URL)
        if pid_owned_by "$pid" "$path" 'artisan serve'; then
            status_line="running (pid ${pid})"
            [[ -n $url ]] || url="http://127.0.0.1:${port}"
        else
            status_line="stopped"
            if [[ -n $port ]] && port_in_use "$port"; then
                status_line="stopped (port ${port} is used by another process)"
            fi
        fi
        printf '%s\n' "$path"
        printf '  port:   %s\n' "${port:-?}"
        printf '  url:    %s\n' "${url:-http://127.0.0.1:${port}}"
        printf '  status: %s\n' "$status_line"
        printf '  log:    %s/serve.log\n' "$dir"
    done

    [[ $shown -eq 0 && -z $PATH_ARG ]] && say "no previews recorded"
    return 0
}

case $COMMAND in
    start) cmd_start "$@" ;;
    stop) cmd_stop "$@" ;;
    status) cmd_status "$@" ;;
    help | -h | --help) usage ;;
    *) usage >&2 && exit 2 ;;
esac
