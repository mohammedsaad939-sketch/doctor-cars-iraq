#!/usr/bin/env bash
# Wired as npm's "prebuild" lifecycle script -- runs automatically before `npm run build`.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
echo "[pre-build] checking Supabase env vars are documented (not their values) ..."
if [ ! -f .env.local ] && [ -z "${VITE_SUPABASE_URL:-}" ]; then
  echo "[pre-build] note: no .env.local and no VITE_SUPABASE_URL in the environment."
  echo "[pre-build]       the app will still build, but will warn at runtime (see supabaseClient.js)."
fi
exit 0
