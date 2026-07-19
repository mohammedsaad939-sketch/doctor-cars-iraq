#!/usr/bin/env bash
# Real git post-commit hook (wired via `git config core.hooksPath .claude/hooks`).
# Non-blocking (git ignores this hook's exit code) -- informational only.
cd "$(git rev-parse --show-toplevel)" || exit 0
echo "[post-commit] $(git log -1 --pretty='%h %s')"
exit 0
