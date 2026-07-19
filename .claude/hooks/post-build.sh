#!/usr/bin/env bash
# Wired as npm's "postbuild" lifecycle script -- runs automatically after `npm run build`.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
echo "[post-build] bundle sizes:"
du -h dist/assets/* 2>/dev/null | sort -rh | sed 's/^/  /'
exit 0
