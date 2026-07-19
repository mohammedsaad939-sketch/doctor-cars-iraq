# Automotive SEO — Review Checklist

## Core Checklist
- [ ] index.html metadata accurate.
- [ ] SEO proposals acknowledge the CSR limitation.
- [ ] robots.txt/sitemap only added once real crawlable URLs exist.

## Do
- [ ] Keep `index.html` metadata accurate and primary-language-first.
- [ ] Be explicit that real SEO requires SSR/SSG/prerendering given the current architecture.

## Don't (verify avoided)
- [ ] Avoided: Don't add a sitemap listing URLs that don't actually exist (the app has no real per-screen routes yet).
- [ ] Avoided: Don't try to "trick" crawlers with client-only meta-tag changes when the underlying content isn't server-rendered.

## Common Mistakes to Re-check
- [ ] Not repeating: Assuming adding `<meta name="description">` variations meaningfully improves ranking for content that only renders after JS execution and has no unique URL.
