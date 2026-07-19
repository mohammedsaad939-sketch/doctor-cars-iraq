# Search Filters

Reference for `ShopScreen.jsx`/`HomeScreen.jsx` category and (future) text-search filtering.

## Category taxonomy (from `MOCK.categories`)
قطع الغيار (parts), الإطارات (tires), البطاريات (batteries), الزيوت (oils), إكسسوارات
(accessories), العدد والأدوات (tools), خدمات الورش (workshop services), السيارات (vehicles),
المزادات (auctions), الجملة (wholesale), الطوارئ (emergency), الأكاديمية (academy).

## Filter propagation
`HomeScreen` category shortcuts call `navigate("shop", { category })`; `App.jsx#navigate` sets
`selectedCategory`, passed to `ShopScreen` as `initialCategory`. Any new filter entry point should
follow this same one-directional flow rather than introducing parallel filter state.

## Free-text search (not yet implemented)
If/when added, debounce input before querying, and use Postgres `ilike`/`textSearch` via the
Supabase query builder (parameterized) — never string-concatenate user input into a raw query.
