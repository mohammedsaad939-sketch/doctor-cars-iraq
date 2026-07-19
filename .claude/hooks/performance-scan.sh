#!/usr/bin/env bash
# Reports bundle size (after a build) and flags oversized screen files,
# per the automotive-performance skill's thresholds.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

echo "[performance-scan] largest screen files (split candidates over 400 lines):"
wc -l screens/*.jsx 2>/dev/null | sort -rn | awk '$1 > 400 && $2 != "total" { printf "  %-6s %s\n", $1, $2 }'

if [ -d dist ]; then
  echo "[performance-scan] dist/ bundle sizes:"
  du -h dist/assets/* 2>/dev/null | sort -rh | sed 's/^/  /'
else
  echo "[performance-scan] no dist/ found -- run 'npm run build' first for bundle-size numbers."
fi

echo "[performance-scan] screens eagerly imported in App.jsx (no code-splitting yet):"
grep -c '^import .*from "\./screens/' App.jsx | sed 's/^/  /' || true
exit 0
