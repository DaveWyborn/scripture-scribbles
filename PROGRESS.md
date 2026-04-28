# Scripture Scribbles - Progress Summary

**Last Updated:** 2026-04-28

---

## Current Status: v1.4.1 LIVE ✅

**URL:** https://scripturescribbles.co.uk
**Live file:** `scripture-scribbles-v1.3.html` (filename historic; contents are v1.4.1)

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

### v1.4.1 ✅ — Editorial design system + continuous scroll

**Shipped:** April 2026

**Editorial design system (unplanned headliner):**
- Deep Ink theme — Literata + IBM Plex Sans, dark editorial palette
- Design tokens extracted; 9 themes re-paletted onto the same system
- Margin-only verse numbers (honours "never inline" rule)
- Quiet, muted scrollbar that fades into the background
- Welcome screen redesign, duplicate landing page removed
- Sermon notes UI redesign — polished toolbar, visible Details button, slim mobile UI
- Settings panel widened, contextual help text, inline font previews
- Cross-mode font-size consistency

**Features:**
- Continuous scroll — auto-loads next chapter as you scroll (fluid + verse modes)
- Auto-mark-as-read + focus mode opacity slider

**Bug fixes:**
- Reading history persistence on reload for logged-in users
- Verse number style not applying in verse-by-verse mode
- Sermon notes panel inheriting reading typography settings
- Trix toolbar icons unreadable on dark themes (multiple passes)

**Infra:**
- Supabase keepalive fixed (`/health` was failing silently — now queries PostgREST + VPS cron backup)
- Favicon — amber SS monogram

---

### v1.4.0 ✅ — Sermon / Message Notes + Reading Bar + Scroll Nav

**Shipped:** April 2026

**Sermon Notes:**
- Split-view layout (desktop: Bible left, notes right)
- Mobile tab switching (Bible ↔ Notes)
- Trix rich-text editor (headers, lists, bold, italic)
- Collapsible sermon metadata (speaker, date, passage)
- Quick verse insertion (select verse → insert into notes)
- Supabase persistence
- Trix mobile init fix (deferred editor mounting)
- Trix dark theme fix (inverted SVG icons, stripped borders)
- CSS load order fix (sermons.css after Trix)
- Notebook-style redesigned notes UI

**Reading Bar (killer differentiator):**
- Draggable focus bar — 3 styles
- Touch + mouse positioning

**Scroll Navigation:**
- Section outline for fluid and passage modes

**Other:**
- Hebrew heading styling (Psalm 119 section dividers)
- USFM converter fix for mid-verse \d headings
- Hard refresh button in settings (Safari cache-busting)
- Passage mode reading position save/restore
- Reading history (mark sections/chapters as read)

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

1. **v1.5.0** — Word-level highlighting (smart merge rules)
2. **Analytics** — privacy-respecting counter so we can measure progress to the 1,000-user gate (currently flying blind)
3. Polish/UX: loading states, empty states, micro-interactions
4. Strategic: reach 1,000 users before building paid features (v1.6.0)

---

## Strategic Context

**1,000-user gate:** Paid features (v1.6.0) are deferred until 1,000 users reached.
**Charity transition:** v2.0.0 planned at 10,000 users — UK CIO + Wycliffe partnership (40% revenue).
**Full roadmap:** `scripture-scribbles-roadmap.md`
**Decision log:** `DECISIONS.md`
