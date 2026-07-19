# Folder Structure

```
doctor-cars-iraq/
├── App.jsx                    # root component: navigation, global state, PWA, i18n
├── main.jsx                   # React DOM entry point
├── index.html                 # HTML shell + meta tags
├── index.css                  # minimal global reset
├── useAuth.js                 # session/profile hook
├── supabaseClient.js           # Supabase client construction (reads env vars)
├── vite.config.js
├── vitest.config.js            # test runner config (added in this change)
├── eslint.config.js            # lint config (added in this change)
├── vercel.json                 # SPA rewrite rule for Vercel
├── package.json
│
├── screens/                    # one component per screen id, flat (24 screens)
│   └── *.jsx
│
├── utils/
│   ├── theme.js                 # T design tokens + toWhatsAppNumber/relativeTime
│   ├── components.jsx           # presentational primitives + MOCK fixture + AdCarousel/ProductCard
│   ├── hooks.js                 # shared data-fetching helpers (grow this)
│   ├── supabase.js              # re-export of the Supabase client
│   ├── validators.js            # isUUID (added in this change)
│   ├── theme.test.js            # unit tests (added in this change)
│   └── validators.test.js       # unit tests (added in this change)
│
├── public/
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # service worker
│
├── docs/                        # project-wide documentation (this file and siblings)
│
├── .github/
│   ├── copilot-instructions.md  # the 6 canonical review-flagged bug patterns
│   ├── pull_request_template.md
│   └── ISSUE_TEMPLATE/
│
└── .claude/                     # Skills / Agents / Hooks / Workflows / Templates / Knowledge
    ├── skills/<name>/{SKILL.md,README.md,LICENSE.txt,examples.md,checklists.md}
    ├── agents/<name>/{AGENT.md,README.md}
    ├── hooks/*.sh + README.md
    ├── workflows/*.md
    ├── templates/*.md
    └── knowledge/*.md
```

## Known organization debt (see `docs/AUDIT.md` for full detail)
- `screens/` is flat with no domain subfolders (marketplace/seller/account/etc.) — acceptable at
  24 screens, worth revisiting if the count keeps growing.
- `utils/components.jsx` mixes pure presentational primitives (`Badge`, `Btn`, `Card`, ...) with
  a data-fetching component (`AdCarousel`) and a large mock-data fixture (`MOCK`) — a good future
  split into `components/ui/*` vs `components/commerce/*`, not done in this change to avoid a
  wide-blast-radius import-path change across every screen without full test coverage in place.
