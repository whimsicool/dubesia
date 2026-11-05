#!/usr/bin/env bash
set -euo pipefail

if [[ "${SSH_ORIGINAL_COMMAND:-}" =~ ^deploy\ ([0-9a-f]{40})$ ]]; then
    exec bash /home/ubuntu/.local/bin/dubesia-deploy "${BASH_REMATCH[1]}"
fi

echo "Kunci ini hanya boleh menjalankan deployment commit yang lulus CI." >&2
exit 1
