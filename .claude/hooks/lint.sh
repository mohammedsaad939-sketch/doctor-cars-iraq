#!/usr/bin/env bash
# Runs ESLint across the repo. Used standalone, by pre-commit, and by CI/agents.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
echo "[lint] running eslint ..."
npm run lint
