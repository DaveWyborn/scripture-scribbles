# Project: Scripture Scribbles

**Status:** Active
**Last updated:** 2026-02-23

## Purpose

Dyslexia-friendly Bible reading app with rich annotations, focus tools, and sermon notes. Targets users who struggle with standard Bible apps (too cluttered, no accessibility controls).

## Stack / Key Decisions

- **Vanilla JS, no framework, no build step**: Entry point is an HTML file; JS/CSS split into modules under `js/` and `css/`. Keeps deployment trivial (GitHub Pages) and reduces complexity for a solo dev.
- **Supabase**: Auth (email + Google OAuth) + cloud sync. Chosen over Firebase for simpler RLS, PostgreSQL familiarity, and open-source model.
- **IndexedDB**: Local annotation storage with Supabase as sync layer. Offline-first with cloud backup.
- **GitHub Pages + Cloudflare DNS**: Zero-cost hosting for a pre-revenue product. Auto-deploys on push to main.
- **WEB Bible (Markdown, bundled)**: Public domain, instant, offline. 7MB for all 66 books. No API costs.
- **Trix editor**: Rich text for sermon/message notes (v1.4 work-in-progress).
- **USFM → JSON conversion**: Parse public domain Bibles once offline, bundle as enhanced JSON with paragraph + heading data.

## What's Done

- v1.1.0: Auth, cloud sync, full WEB Bible (66 books), visual book/chapter navigation, 6-colour highlights + underlines, verse notes + tags, 3 annotation sets, 24 themes, export (Markdown + JSON)
- v1.2.0: Reading/fluid mode (paragraphs, not verse-by-verse), UI simplification, multiple public domain Bibles (WEB + ASV + KJV), gentle animations
- v1.3.0: Full dyslexia typography controls (font, size, line/letter/word spacing), colour customisation, dyslexia-optimised themes — shipped Dec 2025
- v1.4.0 (in progress): Sermon/message notes with Trix rich-text editor, split-view desktop layout, mobile tab switching, verse insertion into notes, collapsible metadata, Supabase persistence

## What's Next

- Stabilise v1.4.0 sermon notes (Trix initialisation on mobile is the current blocker)
- Reading bar (v1.3.0 planned but may have slipped to post-1.4) — the key differentiator: digital ruler for dyslexic readers
- Multiple Bible version selector (v1.2 work may be partially done)

## Blockers / Open Questions

- Trix editor initialisation is flaky on mobile (multiple recent commits fixing this — not yet resolved cleanly)
- Reading bar status unclear — roadmap targets v1.3.0 but recent commits are all sermon notes; confirm whether it shipped
- Docs (PROGRESS.md, roadmap docs) are ~15 months out of date (written Nov 2024); rely on git log + HTML files for actual state
- 1,000-user threshold not yet reached — paid features (v1.6.0) are gated on this

## Key Files

- `scripture-scribbles-v1.3.html` — current live app (v1.3.26), also where v1.4 work lands
- `index.html` — landing page
- `preview.html` — redirects to current live file
- `js/` — JS modules: app, annotations, auth, bible-loader, navigation, preferences, sermons, state, tag-manager, typography, ui, verse-renderer
- `css/` — stylesheets: base, components, sermons, themes
- `WEB/` — World English Bible source files (Markdown, 7MB, 66 books)
- `scripture-scribbles-roadmap.md` — master planning doc
- `PROGRESS.md` — detailed progress summary
- `DECISIONS.md` — decision log
- `bible-versions-strategy-summary.md` — hybrid free/premium Bible version strategy
- `SUPABASE-SETUP-GUIDE.md` — database setup
