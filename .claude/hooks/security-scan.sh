#!/usr/bin/env bash
# Lightweight heuristic scan for the bug patterns documented in
# .github/copilot-instructions.md and the automotive-security skill.
# This is a fast, imprecise pre-filter -- it flags *candidates* for human/agent
# review, it does not replace the automotive-security agent's real review.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

fail=0
say() { echo "[security-scan] $1"; }

say "checking for window.open(...) missing noopener/noreferrer ..."
if grep -rn --include="*.jsx" --include="*.js" 'window\.open(' . \
    --exclude-dir=node_modules --exclude-dir=dist | grep -v 'noopener'; then
  say "  ^ found window.open(...) without an explicit noopener/noreferrer features string"
  fail=1
else
  say "  none found"
fi

say "checking for dead onClick={() => {}} handlers ..."
if grep -rn --include="*.jsx" 'onClick={() => {}}' . \
    --exclude-dir=node_modules --exclude-dir=dist; then
  say "  ^ found empty onClick handlers (Pattern 6 in copilot-instructions.md)"
  fail=1
else
  say "  none found"
fi

say "checking for RLS policies without a nearby GRANT (*.sql files, if any) ..."
sql_files=$(git ls-files '*.sql' 2>/dev/null || true)
if [ -n "$sql_files" ]; then
  for f in $sql_files; do
    if grep -qi 'create policy' "$f" && ! grep -qi 'grant ' "$f"; then
      say "  ^ $f defines a policy with no GRANT in the same file (Pattern 3)"
      fail=1
    fi
  done
else
  say "  no .sql files tracked in this repo (schema lives in the Supabase project)"
fi

say "checking for select-then-decide races against unique-constrained writes ..."
if grep -rn --include="*.jsx" --include="*.js" -A2 '\.maybeSingle()' . \
    --exclude-dir=node_modules --exclude-dir=dist | grep -B2 'insert(' | grep -q 'maybeSingle'; then
  say "  ^ found a maybeSingle() lookup immediately followed by an insert() -- verify this isn't a Pattern 4 race"
  fail=1
else
  say "  none found"
fi

if [ "$fail" -eq 0 ]; then
  say "no heuristic findings. Run the automotive-security skill's full checklist for a real review."
else
  say "heuristic findings above are candidates for review, not automatic failures."
fi
exit 0
