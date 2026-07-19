#!/usr/bin/env bash
# Aggregate "review" hook: lint + test + build + heuristic security/performance scans.
# Intended to be run before opening a PR, and by the reviewer agent.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
status=0

run() {
  echo ""
  echo "=== $1 ==="
  if ! bash ".claude/hooks/$2"; then
    echo "[review] $1 FAILED"
    status=1
  fi
}

run "lint" "lint.sh"
echo ""
echo "=== test ==="
if ! npm test; then echo "[review] test FAILED"; status=1; fi
echo ""
echo "=== build ==="
if ! npm run build; then echo "[review] build FAILED"; status=1; fi
run "security-scan" "security-scan.sh"
run "performance-scan" "performance-scan.sh"

echo ""
if [ "$status" -eq 0 ]; then
  echo "[review] all checks passed."
else
  echo "[review] one or more checks failed -- see above."
fi
exit $status
