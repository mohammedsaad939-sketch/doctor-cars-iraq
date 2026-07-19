# Contributing to Doctor Cars Iraq

## Getting started
See `docs/DEVELOPER_GUIDE.md` for setup, everyday commands, and the pre-PR checklist.

## Before you start a change
1. Check `docs/AUDIT.md` for known issues in the area you're touching.
2. Check `.claude/skills/` for a skill covering your change's domain — it has the coding standards,
   do/don't list, and common mistakes specific to that area.
3. For anything touching more than one screen or `App.jsx`'s navigation/global state, read
   `automotive-platform` first.

## Workflow
Pick the closest match in `.claude/workflows/` (feature-development, bug-fix, refactor, etc.) and
follow its steps. Each workflow names the skills/agents most relevant to it.

## Pull requests
- Fill out `.github/pull_request_template.md` (auto-populated).
- Run `npm run review` before requesting review.
- Reference the relevant skill(s) in your PR description.

## Code review
Reviewers check PRs against:
1. `.github/copilot-instructions.md`'s six patterns (blocking if violated).
2. The relevant skill's `checklists.md`.
3. `docs/CODING_STANDARDS.md` for anything not covered by a specific skill.

## Security
This app has no server-side API — Postgres RLS is the only access-control boundary. Any change
touching auth, admin gating, or a Supabase mutation should be reviewed against `automotive-security`
before merge.

## Questions
If a convention isn't documented anywhere in `.claude/skills/`, `.claude/knowledge/`, or `docs/`,
that's a gap — add it once you've resolved the question, rather than letting the answer live only
in a PR comment thread.
