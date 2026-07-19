# Vehicle Data — Review Checklist

## Core Checklist
- [ ] Query selects only needed columns.
- [ ] No `MOCK` import for data with a live table.
- [ ] snake_case → camelCase mapping happens once, at the query boundary.
- [ ] VIN/part-number/UUID inputs validated before write.
- [ ] Schema doc updated if a new column was introduced.

## Do
- [ ] Keep `.claude/knowledge/vehicle-schema.md` updated whenever a new column is discovered or added.
- [ ] Use `maybeSingle()` instead of `single()` when a zero-row result is an expected, non-error case (as `AdCarousel` already does).
- [ ] Normalize discount/pricing math in one place (see `ProductCard`'s `isDiscounted`/`discountedPrice` logic) rather than recomputing it per screen.

## Don't (verify avoided)
- [ ] Avoided: Don't add new hardcoded arrays that look like `MOCK` data for a feature that will eventually read from Supabase — build the empty/loading state instead.
- [ ] Avoided: Don't `select("*")` when only a handful of columns are displayed.
- [ ] Avoided: Don't silently coerce a missing/invalid VIN or part number into an empty string in a way that lets it pass validation later.

## Common Mistakes to Re-check
- [ ] Not repeating: Leaving a screen wired to `MOCK.products` after the corresponding Supabase table went live, so real inventory changes never show up (flagged in `.github/copilot-instructions.md` Pattern 2).
- [ ] Not repeating: Comparing prices as strings instead of numbers (Iraqi dinar values can be large; watch for `toLocaleString("ar-IQ")` being applied to a string instead of a number).
- [ ] Not repeating: Assuming `images` is always an array (the codebase already has to guard with `Array.isArray(data.images) ? data.images[0] : data.images`) — repeat this guard anywhere `images` is read.
