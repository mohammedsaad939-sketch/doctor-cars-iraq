---
name: automotive-seo
description: Search-engine visibility constraints and opportunities for a client-side-only React/Vite SPA.
license: Complete terms in LICENSE.txt
---

# Automotive SEO

## Purpose
Set realistic expectations and concrete actions for SEO given this app has no SSR/SSG — most crawlers see an empty `<div id="root">` on first load unless mitigations are in place.

## Scope
- `index.html` (meta tags, title)
- `public/manifest.json` (PWA metadata, also read by some search/app-install surfaces)
- Any future sitemap/robots.txt

## Responsibilities
- Keep `index.html`'s `<title>`/meta description accurate and in Arabic (the primary audience) since that's the only content most crawlers reliably see without executing JS.
- Flag that product/listing detail pages are not server-rendered, so they will not reliably appear in search results by content — this is a structural limitation, not a bug to silently work around with meta-tag tricks.
- Recommend (not silently implement) a path to real SEO: SSR/SSG migration (Next.js/Remix) or a prerendering service for public, crawlable pages (home, category, and individual listing pages) if organic search matters to the business.

## Architecture
Vite + React with client-side rendering only. There is no `robots.txt`/`sitemap.xml` in `public/` today, and no per-route `<title>`/meta management (e.g. no `react-helmet`), because there are no real routes — the URL never changes as `currentScreen` changes.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Follow the existing repo-wide conventions: PascalCase components, camelCase functions/variables, snake_case Supabase columns mapped to camelCase at the query boundary.

## Folder Structure
```
index.html
public/manifest.json
```

## Workflow
- 1. Do not promise SEO wins for content changes alone (this is a CSR app) — be explicit in any proposal about the SSR/SSG/prerender dependency.
- 2. If/when routing is introduced (a real router replacing the `currentScreen` switch), add per-page `<title>`/meta management at the same time.
- 3. Add `robots.txt`/`sitemap.xml` only once there are real crawlable URLs to list — an empty sitemap for a single-URL SPA provides no value.

## Performance Rules
- Faster first paint (see `automotive-performance`) helps Core Web Vitals, which affects ranking, even without full SSR.

## Security Rules
- Ensure `robots.txt` (once added) does not accidentally disallow crawling of intended-public pages while trying to hide admin/seller-dashboard routes — those should be protected by auth, not by robots directives (which are advisory, not enforced).

## Review Rules
- Flag any "SEO fix" PR that only edits meta tags without acknowledging the CSR/no-URL-routing limitation.

## Do
- Keep `index.html` metadata accurate and primary-language-first.
- Be explicit that real SEO requires SSR/SSG/prerendering given the current architecture.

## Don't
- Don't add a sitemap listing URLs that don't actually exist (the app has no real per-screen routes yet).
- Don't try to "trick" crawlers with client-only meta-tag changes when the underlying content isn't server-rendered.

## Common Mistakes
- Assuming adding `<meta name="description">` variations meaningfully improves ranking for content that only renders after JS execution and has no unique URL.

## Checklist
- index.html metadata accurate.
- SEO proposals acknowledge the CSR limitation.
- robots.txt/sitemap only added once real crawlable URLs exist.

## Prompt Templates
- "Draft a plan for migrating the marketplace's public listing pages to a prerendered or SSR route so they become crawlable, without a full rewrite of the buyer app."

## Real Examples
```html
<!-- index.html: keep primary-language metadata accurate -->
<title>دكتور السيارات | Doctor Cars Iraq</title>
<meta name="description" content="منصة عراقية متكاملة لقطع الغيار والخدمات والمزادات">
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
