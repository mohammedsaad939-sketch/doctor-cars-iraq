#!/usr/bin/env bash
# Real git pre-commit hook (wired via `git config core.hooksPath .claude/hooks`).
# Fast checks only: lint + unit tests. Keep this quick -- it runs on every commit.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

echo "[pre-commit] linting ..."
if ! npm run lint; then
  echo "[pre-commit] lint failed -- commit blocked. Fix the errors above (warnings do not block)."
  exit 1
fi

echo "[pre-commit] running unit tests ..."
if ! npm test; then
  echo "[pre-commit] tests failed -- commit blocked."
  exit 1
fi

echo "[pre-commit] ok."
exit 0
