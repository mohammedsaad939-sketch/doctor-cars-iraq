#!/usr/bin/env bash
# Smoke-checks a deployed URL after Vercel finishes deploying.
# Usage: .claude/hooks/post-deploy.sh https://doctor-cars-iraq.vercel.app
set -uo pipefail
url="${1:-}"
if [ -z "$url" ]; then
  echo "[post-deploy] usage: post-deploy.sh <deployed-url>"
  echo "[post-deploy] (Vercel prints the deployment URL in the PR check / dashboard)"
  exit 0
fi
echo "[post-deploy] checking $url ..."
code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
if [ "$code" = "200" ]; then
  echo "[post-deploy] $url responded 200 OK."
else
  echo "[post-deploy] $url responded HTTP $code -- investigate before announcing the release."
  exit 1
fi
