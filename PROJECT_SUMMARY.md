# Project: Scripture Scribbles

**Status:** Active
**Last updated:** 2026-04-08

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
- v1.4.0 (shipped Apr 2026): Sermon/message notes (Trix rich-text editor, split-view, mobile tabs, verse insertion, Supabase persistence), reading bar (draggable focus aid, 3 styles), scroll navigation, reading history, passage mode with position save/restore, Hebrew heading styling, USFM converter fixes

## What's Next

- v1.4.1: Continuous scroll navigation (auto-load next chapter), verse formatting style selection
- v1.5.0: Word-level highlighting with smart merge rules
- Polish/UX: loading states, empty states, micro-interactions
- Strategic: reach 1,000 users before building paid features (v1.6.0)

## Blockers / Open Questions

- 1,000-user threshold not yet reached — paid features (v1.6.0) are gated on this
- No analytics/tracking to measure user count — need to determine how to measure progress toward 1,000-user goal

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
