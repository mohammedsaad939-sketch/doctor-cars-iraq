# Automotive Search — Review Checklist

## Core Checklist
- [ ] Comparison logic reused from App.jsx, not duplicated.
- [ ] Product id comparisons consistently use String() coercion.
- [ ] Search inputs debounced before querying.
- [ ] Category filters use the query builder, not raw string concatenation.

## Do
- [ ] Reuse `handleCompare`'s toggle/cap-at-3 logic for any new comparison entry point.
- [ ] Keep category ids/names consistent between `HomeScreen` shortcuts and `ShopScreen` filters.

## Don't (verify avoided)
- [ ] Avoided: Don't build a second, parallel comparison list.
- [ ] Avoided: Don't query Supabase on every keystroke without debouncing.

## Common Mistakes to Re-check
- [ ] Not repeating: Comparing product ids as numbers in one place and strings in another, silently breaking `compareSet` membership checks.
- [ ] Not repeating: Adding a filter dropdown to `ShopScreen` that doesn't reset when `initialCategory` changes via a `HomeScreen` shortcut.
