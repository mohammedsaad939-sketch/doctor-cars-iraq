# Workflow: Documentation

## When to use
Architecture, schema, or convention changes that make `docs/` or `.claude/knowledge/` stale.

## Steps
1. Identify the single authoritative doc for the topic (avoid creating a second overlapping doc).
2. Update it in the same PR as the code change where feasible — docs updated after the fact drift.
3. For schema changes, update `.claude/knowledge/vehicle-schema.md` (and any more specific doc,
   e.g. `pricing-rules.md`) to match the real query shape.
4. For convention changes, update the owning skill's `SKILL.md`/`examples.md`.

## Skills/Agents involved
`documentation` agent, the owning domain skill.
