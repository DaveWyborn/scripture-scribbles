# Scripture Scribbles — Internal Dev Roadmap

Last updated: 2026-04-06

## Version history

| Version | Status | Summary |
|---------|--------|---------|
| v1.0.0 | Shipped | Core reader, highlights, notes, tags, 6 colours |
| v1.1.0 | Shipped | Auth, cloud sync, WEB Bible, visual nav, annotation sets, 24 themes, export |
| v1.2.0 | Shipped | Fluid/paragraph reading mode, multiple Bibles (WEB + ASV + KJV) |
| v1.3.0 | Shipped | Full dyslexia typography controls, colour customisation, 8 curated themes |
| v1.3.26 | Shipped | Design overhaul (Paper theme, side panel, 720px column), reading bar |
| v1.4.0 | Shipped | Sermon/message notes (Trix editor), split-view, verse insertion |
| v1.4.1 | Next | Scroll navigation, polish |
| v1.5.0 | Planned | Word-level highlighting |
| v1.6.0 | Gated | Paid tier — licensed Bible translations via API |
| v2.0.0 | Vision | Charity registration, Wycliffe partnership, audio reader |

## Outstanding tasks (do before new features)

- [ ] Run `supabase-reading-history.sql` in Supabase SQL editor (cloud sync for reading progress is blocked on this)
- [ ] Set up local dev server (currently all changes push live — risky)
- [ ] Trix mobile init: deferred mounting works but is fragile. Needs a proper lifecycle fix or a lighter editor

## v1.4.1 — Polish and scroll nav

Target: next session

- [ ] Scroll navigation — chapter/section jump menu for long chapters
- [ ] Bottom nav polish — ensure consistent behaviour across reading modes
- [ ] Review and fix any remaining passage mode edge cases

## v1.5.0 — Word-level highlighting

Target: after v1.4.1

- [ ] Select individual words (not just full verses)
- [ ] 6+ colour palette (reuse existing)
- [ ] Word and verse highlights coexist
- [ ] Smart merge rules when adjacent words are highlighted
- [ ] Supabase sync for word-level data (schema change required)
- [ ] Fluid mode support

## v1.5.x — Reading plans Phase 2

- [ ] Pre-built reading plans (e.g. Bible in a Year, Gospels in 30 days)
- [ ] Plan progress tracking and streaks
- [ ] Plan picker UI

## v1.6.0 — Paid tier (gated on 1,000 users)

- [ ] Stripe integration
- [ ] API.Bible integration for licensed translations (NIV, ESV, NASB)
- [ ] 500-verse rolling cache with WEB fallback
- [ ] Subscription management UI

## v2.0.0 — Long-term vision

- [ ] UK CIO charity registration (10,000-user gate)
- [ ] Wycliffe Bible Translators partnership (40% revenue)
- [ ] Audio reader (AI voice or licensed recordings)
- [ ] Mobile app (PWA or native wrapper)
- [ ] Advanced search across annotations

## Feature backlog (unscheduled)

- Custom annotation colours (user-defined palette)
- Annotation cleanup/bulk delete tools
- Cross-reference links between verses
- Shared annotations (e.g. small group leader shares highlights)
- Offline PWA improvements (service worker, install prompt)
- Analytics dashboard (user count, feature usage — privacy-respecting)

## Architecture notes

- 15 JS modules under `js/`, main HTML file is `scripture-scribbles-v1.3.html` (592 lines)
- No build step — all modules loaded via script tags
- Supabase for auth + sync, IndexedDB for local storage
- GitHub Pages deployment, Cloudflare DNS
- Enhanced JSON Bibles (WEB/ASV/KJV) converted from USFM, gzipped
