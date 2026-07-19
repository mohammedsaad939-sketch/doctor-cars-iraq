#!/usr/bin/env bash
# Deploy gate: run this before pushing to the branch Vercel deploys from.
# Not auto-wired (Vercel deploys are triggered by git push, not an npm script) --
# invoke manually, or from the deployment workflow / a future CI step.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
echo "[pre-deploy] running full review gate (lint + test + build + scans) ..."
bash .claude/hooks/review.sh
exit $?
