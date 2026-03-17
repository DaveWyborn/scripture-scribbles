# Scripture Scribbles - Progress Summary

**Last Updated:** 2026-02-23

---

## Current Status: v1.3.26 LIVE ✅

**URL:** https://scripturescribbles.co.uk
**Live file:** `scripture-scribbles-v1.3.html`

---

## Completed Versions

### v1.1.0 ✅
- Supabase authentication (email + Google OAuth)
- Cloud sync for annotations
- WEB Bible embedded (all 66 books)
- Visual navigation (modal with book/chapter grids)
- 6-colour highlights + underlines
- Verse notes + tags with custom colours
- Multiple annotation sets (Study, Church, Personal)
- 24 themes (light + dark)
- Export annotations (Markdown + JSON)
- Works on all devices (mobile + desktop)
- "Why We Exist" page + interactive roadmap with voting

### v1.2.0 ✅
- Fluid reading mode (paragraphs, not verse-by-verse)
- Multiple public domain Bibles (WEB, ASV, KJV)
- USFM → JSON conversion (paragraphs + headings)
- Reading mode toggle (verse-by-verse vs fluid)
- UI simplification — clutter removed, auto-hide chrome
- Configurable tap behaviour
- Gentle animations and transitions
- Bible version selector

### v1.3.0 ✅ (current live)
- Full typography controls (font size, line/letter/word spacing)
- Dyslexia-friendly font selection (OpenDyslexic, Atkinson Hyperlegible, system fonts)
- Full colour customisation (background, text, annotation)
- Cloud-synced preferences (persist across devices)
- "Remember me" auth option
- Improved mobile experience
- Codebase refactored into separate JS/CSS modules (see Architecture below)

---

## In Progress: v1.4.0 - Sermon / Message Notes

**Status:** Active development — core features built, fixing mobile issues

**Done:**
- Split-view layout (desktop: Bible left, notes right)
- Mobile tab switching (Bible ↔ Notes)
- Trix rich-text editor integration
- Markdown toolbar (headers, lists, bold, italic)
- Collapsible sermon metadata (speaker, date, passage)
- Quick verse insertion (select verse → insert into notes)
- Supabase persistence for sermon notes
- Verse formatting styles

**Blocking:**
- Trix initialisation flaky on mobile — editor fails when host element is hidden on load. Multiple fixes committed (Feb 2026), not fully resolved. Must ensure editor DOM is visible before calling `trix-editor` init, or defer until first tab activation.

---

## Architecture (Current)

The app was refactored from a monolithic single HTML file into separate JS/CSS modules (Nov–Dec 2025):

**JS modules (`js/`):**
- `app.js` — bootstrapping, init, event wiring
- `annotations.js` — highlights, underlines, notes, tags
- `auth.js` — Supabase auth, session management
- `bible-loader.js` — Bible text loading + parsing
- `navigation.js` — chapter/book navigation
- `preferences.js` — typography + colour settings
- `sermons.js` — sermon/message notes (v1.4, in progress)
- `state.js` — shared app state
- `tag-manager.js` — tag CRUD
- `typography.js` — font/spacing controls
- `ui.js` — UI rendering, modals, menus
- `verse-renderer.js` — verse + paragraph rendering

**CSS (`css/`):**
- `base.css` — reset, layout foundations
- `components.css` — shared UI components
- `sermons.css` — sermon notes panel
- `themes.css` — 24 theme definitions

**HTML files:**
- `scripture-scribbles-v1.3.html` — live app (entry point for JS/CSS)
- `scripture-scribbles-v1.3-test.html` — older baseline (v1.3.0, Dec 2025)
- `scripture-scribbles-v1.2.html` — archived v1.2 (Nov 2025)
- `scripture-scribbles-v1.1-refactored.html` — archived v1.1 refactor
- `preview.html` — redirects to current live file

---

## What's Next

1. Fix Trix mobile initialisation (current blocker for shipping v1.4)
2. Reading bar — the killer differentiator feature (planned v1.3, may have slipped — confirm)
3. Export sermon notes to Markdown

---

## Strategic Context

**1,000-user gate:** Paid features (v1.6.0) are deferred until 1,000 users reached.
**Charity transition:** v2.0.0 planned at 10,000 users — UK CIO + Wycliffe partnership (40% revenue).
**Full roadmap:** `scripture-scribbles-roadmap.md`
**Decision log:** `DECISIONS.md`
