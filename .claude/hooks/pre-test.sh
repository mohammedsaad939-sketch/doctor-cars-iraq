#!/usr/bin/env bash
# Wired as npm's "pretest" lifecycle script -- runs automatically before `npm test`.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
if [ ! -f vitest.config.js ]; then
  echo "[pre-test] vitest.config.js missing -- aborting."
  exit 1
fi
exit 0
