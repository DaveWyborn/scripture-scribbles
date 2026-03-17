# Scripture Scribbles - Project Context

## Project Overview

**Scripture Scribbles** is a dyslexia-friendly Bible reading app with powerful focus tools and rich annotations.

**Live:** https://scripturescribbles.co.uk
**GitHub:** https://github.com/DaveWyborn/scripture-scribbles
**License:** MIT (open source)

## Core Mission

Make Bible reading accessible and beautiful for people with dyslexia.

**Strategic positioning:** Anti-YouVersion simplicity
- Beautiful, minimal reading experience (not 16+ menu items)
- Powerful dyslexia tools (reading bar, spacing controls)
- Focus on reading, not feature bloat
- Clean UI that stays out of the way

**Key innovations:**
- **Reading bar** (mimics physical ruler for dyslexic readers - truly unique)
- Full spacing controls (line, letter, word spacing - research-backed)
- Fluid reading mode with paragraphs (not just verse-by-verse)
- Configurable tap behaviour (reduce accidental triggers)
- Optional content expansion (devotionals, explainers - OFF by default)

**Long-term vision:**
- Primary: Dyslexia-friendly Bible reader
- Secondary: Tool becomes known in dyslexia community
- Future: May expand to serve dyslexic readers beyond Bible (v2.5.0+ if traction)
- Charity: Transition to UK charity funding Bible translation (v2.0.0 at 10k users)

## Current Version: v1.3.26 (LIVE) ✅

**Features:**
- Supabase authentication + cloud sync
- WEB, ASV, KJV Bibles embedded (all 66 books, fluid + verse-by-verse modes)
- Visual navigation (modal with book/chapter grids)
- Full typography controls (font, size, line/letter/word spacing, dyslexia fonts)
- Full colour customisation (background, text, annotation)
- 6-colour highlighting + underlines
- Verse notes and tags
- Multiple annotation sets (Study, Church, Personal)
- 24 themes + dyslexia-optimised themes
- Export annotations (Markdown + JSON)
- Works on all devices (mobile + desktop)
- Cloud-synced preferences

**In progress (v1.4.0):**
- Sermon / message notes (Trix editor, split-view, verse insertion, Supabase persistence)

**Architecture:**
- Supabase backend (auth + PostgreSQL storage)
- Vanilla JavaScript — no framework, no build step
- Separate JS modules in `js/` directory (see Key Files)
- Separate CSS in `css/` directory
- IndexedDB for local annotation storage
- GitHub Pages hosting

## Strategic Milestone: Prove Concept Before Scaling

**Goal:** Reach 1,000 users with beautiful, minimal, accessible reading
**Timeline:** Focus on v1.2.0-v1.3.0 before paid features
**Decision point:** If 1,000 users → continue to paid tiers. If not → re-evaluate.

**Focus areas:**
1. Beautiful, minimal reading (anti-YouVersion simplicity)
2. Fluid reading mode (paragraphs, not just verses)
3. Full dyslexia controls (fonts, spacing, colours)
4. Reading bar (innovative focus aid - killer feature)

## Next Versions

**v1.2.0 - Beautiful Minimal Reading + Fluid Mode** (3-4 weeks)
- UI simplification (remove clutter, hide chrome, configurable tap)
- USFM → Enhanced JSON converter
- Paragraphs + section headings (WEB, ASV, KJV)
- Reading mode vs verse-by-verse toggle
- Gentle animations

**v1.3.0 - Full Dyslexia Controls + Reading Bar** (2-3 weeks)
- Font selection (OpenDyslexic, Atkinson Hyperlegible, system fonts)
- Spacing controls (font size, line spacing, letter spacing, word spacing)
- Full colour customisation
- **Reading bar** (focus aid with blur/fade/tint/ruler styles)
- Dyslexia-optimised themes

**v1.8.0 - Devotionals & Explainers** (Optional expansion)
- Opt-in devotionals (OFF by default, separate section)
- Book/chapter explainers (collapsed, optional)
- No bloat - disable completely removes from UI

**v2.0.0 - Charity Transition** (When 10k users)
- Register as UK charity (CIO)
- Partner with Wycliffe (40% revenue to Bible translation)
- Better publisher licensing terms
- Multiple revenue streams (donations, grants, church partnerships)

**v2.5.0+ - Beyond Bible Content** (Future, if strong dyslexia traction)
- Christian books, articles, general reading, PDFs
- Same powerful dyslexia tools for any content
- Becomes outreach tool to wider dyslexia community
- Bible remains primary mission and content

## Key Files

**Application:**
- `index.html` - Landing page (links to v1.3 live app)
- `scripture-scribbles-v1.3.html` - Main application (current live, v1.3.26)
- `scripture-scribbles-v1.3-test.html` - Baseline v1.3.0 (Dec 2025, pre-sermon-notes)
- `preview.html` - Redirects to current live file
- `js/` - JavaScript modules (app, annotations, auth, bible-loader, navigation, preferences, sermons, state, tag-manager, typography, ui, verse-renderer)
- `css/` - Stylesheets (base, components, sermons, themes)

**Bible Data:**
- `WEB/` - World English Bible (public domain, markdown)
- 7MB, 66 books, full Bible text

**Documentation:**
- `README.md` - Project overview
- `LICENSE` - MIT license
- `DEPLOYMENT.md` - Deployment guide
- `SUPABASE-SETUP-GUIDE.md` - Database setup instructions

**Design & Planning:**
- `scripture-scribbles-roadmap.md` - **Complete roadmap** (master planning doc)
- `PROGRESS.md` - Current progress summary
- `scripture-scribbles-design-vision.md` - Complete design vision
- `ideas.md` - Original vision document
- `why.html` - "Why We Exist" page

**Bible Versions Research:**
- `bible-versions-strategy-summary.md` - Complete strategy (hybrid free/premium model)
- `bible-paragraph-research.md` - USFM format + paragraphs
- `bible-format-strategy.md` - USFM → JSON conversion approach
- `youversion-analysis.md` - How YouVersion works
- `one-time-purchase-model.md` - e-Sword licensing model
- `sermon-loading-problem.md` - Sermon use case + fallback solution
- `api-license-restrictions.md` - 500-verse cache limits
- `beautiful-reading-experience-research.md` - Reader app UX research
- `charity-model-strategy.md` - Long-term charity transition plan

**Technical:**
- `scripture-scribbles-word-level-annotations.md` - Cross-version annotation strategy
- `scripture-scribbles-storage-strategy.md` - Storage architecture analysis

## Bible Structure

**Source:** `WEB/` directory

**Format:**
```
WEB/
├── 01 - Genesis/
│   ├── Gen-01.md
│   ├── Gen-02.md
│   └── ...
├── 40 - Matthew/
│   ├── Matt-01.md
│   ├── Matt-02.md
│   └── ...
└── ...
```

**Chapter file format:**
```markdown
# Matthew 5

[[Matt-04|← Matthew 04]] | [[Matthew]] | [[Matt-06|Matthew 06 →]]
***

###### v1
Seeing the multitudes, he went up onto the mountain...

###### v2
He opened his mouth and taught them, saying,
```

**Notes:**
- Verses marked with `###### vN`
- May include `<crossref>` tags (can strip or keep)
- Navigation links at top (remove for app use)

## Technology Stack

**Current (v1.3.x):**
- Vanilla JavaScript — no framework, no build step
- Separate JS modules (`js/`) and CSS (`css/`)
- Supabase (PostgreSQL + Auth) — auth and cloud sync
- Row Level Security for data isolation
- IndexedDB for local annotation storage
- GitHub Pages hosting
- Trix (Basecamp) for rich text in sermon notes (v1.4, in progress)

## Design System

**Inspiration:** Cava Design System
**Reference:** https://blakewilton.com/Cava-Design-System

**Themes (planned):**
- 3 light themes (Clean, Warm, Dyslexia)
- 3 dark themes (True Dark, Slate, Dyslexia Dark)

**Fonts:**
- OpenDyslexic (primary for dyslexia)
- Atkinson Hyperlegible
- System serif/sans-serif options

**Colors:**
- Full user customization (background, text, annotations)
- Theme-based annotation palettes
- High contrast options for accessibility

## Development Workflow

**Working directory:**
```
/Users/davewyborn/Documents/1_Project/aiforthewin/ScriptureScribbles/
```

**Git:**
- Main branch for production
- Direct commits okay (solo developer)
- Conventional commit messages

**Deployment:**
- GitHub Pages: scripturescribbles.co.uk
- Auto-deploy on push to main
- Cloudflare DNS

**Release Workflow:**
- Preview: scripturescribbles.co.uk/preview (redirects to current test version)
- Update `preview.html` to point to new test file (e.g., `scripture-scribbles-v1.2.html`)
- Once bug-free, promote to live by updating `index.html` or main entry point
- Archive previous live version before overwriting

**Testing:**
- Manual testing on Chrome, Firefox, Safari
- Mobile testing on iOS Safari, Android Chrome
- Cross-device sync testing (post v1.1.0)

## User Personas

**Primary: Sarah (Dyslexic Christian)**
- Struggles with traditional Bible reading
- Needs font/color flexibility
- Benefits from audio reading
- Wants simple, non-overwhelming UI

**Secondary: Mark (Sermon Note-Taker)**
- Sits in church with phone
- Needs to quickly capture verses
- Preacher jumps around passages
- Wants to review notes later

**Tertiary: Rachel (Bible Study Leader)**
- Prepares weekly studies
- Uses multiple annotation sets
- Needs cross-reference support
- Wants to export/share notes

## Roadmap Summary

See `scripture-scribbles-roadmap.md` for complete details.

**Strategic milestone:** Reach 1,000 users before scaling to paid features

**v1.2.0 - Beautiful Minimal Reading + Fluid Mode**
- UI simplification + configurable tap behaviour
- USFM → JSON converter (WEB, ASV, KJV)
- Paragraphs + section headings
- Multiple Bible versions (public domain)

**v1.3.0 - Full Dyslexia Controls + Reading Bar**
- Font selection + full spacing controls
- Full colour customisation
- **Reading bar** (innovative focus aid - killer feature)
- Dyslexia-optimised themes

**v1.4.0 - Sermon Notes**
- Side-by-side view (desktop), swipe (mobile)
- Quick verse insertion
- Export to Markdown

**v1.5.0 - Word-Level Highlighting**
- Select individual words
- Smart merge with verse highlights

**v1.6.0 - Multiple Bible Versions & Paid Tier**
- Premium: NIV, ESV, NASB via API (£5/month)
- Smart 500-verse cache + WEB fallback
- Stripe integration

**v1.7.0 - Audio Reader (Premium)**
- AI voice with sentence-level highlighting
- Usage-based fair pricing

**v1.8.0 - Devotionals & Explainers (Optional)**
- Opt-in devotionals (OFF by default)
- Book/chapter explainers (collapsed)
- No bloat approach

**v2.0.0 - Charity Transition (10k users)**
- UK charity registration (CIO)
- Wycliffe partnership (40% revenue)
- Better publisher terms

**v2.5.0+ - Beyond Bible (Future)**
- General reading for dyslexia community
- Christian books, articles, PDFs
- Same powerful tools, broader content

## Key Strategic Decisions

**Design Philosophy: Anti-YouVersion Simplicity**
- YouVersion has 16+ menu items, we stay minimal
- Features OFF by default (opt-in expansion)
- Clean UI that hides after 3s
- No bloat, no feature creep
- Beautiful reading over feature count

**Dyslexia Innovation: Reading Bar**
- Mimics physical ruler used by dyslexic readers
- No other digital Bible app has this
- 4 visual styles, 4 height options, 3 positioning modes
- Combined with spacing controls = genuine innovation
- This is the killer feature

**Prove Before Scale**
- Target 1,000 users with v1.2.0-v1.3.0
- If successful → continue to paid tiers
- If not → re-evaluate strategy
- Don't build paid features until validated

**Content Strategy**
- Primary: Bible (always the core mission)
- Secondary: Dyslexia tool reputation
- Future: May expand to general reading (v2.5.0+ if traction)
- Never lose focus on Bible, but tools can serve broader community

**Bible Versions Approach**
- Free tier: Public domain Bibles bundled locally (instant, offline)
- Premium tier: Licensed Bibles via API with smart cache + WEB fallback
- Solves sermon problem (instant fallback when uncached)
- Charity status enables better publisher terms later

**Pricing: Fair and Christian**
- Free tier genuinely useful (not crippled)
- Premium for modern translations and convenience
- Auto-downgrade if usage drops
- No dark patterns
- Charity model: 40% to Wycliffe Bible translation

## Current Status

**v1.1.0:** ✅ SHIPPED - Auth, sync, WEB Bible, visual navigation
**v1.2.0:** ✅ SHIPPED - Fluid reading mode, ASV/KJV, UI simplification
**v1.3.0:** ✅ LIVE (v1.3.26) - Full typography + dyslexia controls, cloud-synced prefs
**v1.4.0:** ⚡ IN PROGRESS - Sermon/message notes (Trix mobile init is current blocker)
**Reading bar:** ⏳ DEFERRED from v1.3 — still to build, highest priority after v1.4

**Strategic milestone:** Get to 1,000 users (gate for paid features)
**Last updated:** 2026-02-23

## Contact & Support

**Developer:** Dave Wyborn
**Email:** (via bug report form)
**GitHub Issues:** https://github.com/DaveWyborn/scripture-scribbles/issues
**Formspree:** mblqkwye (bug reports)

## Session Maintenance

**DECISIONS.md:** When a significant decision is made (architecture, tooling, strategy, UX approach), add an entry before ending the session. Format: date, short title, decision, rationale, consequences. (In Obsidian — see ## Notes.)

**PROJECT_SUMMARY.md:** At the end of any session where meaningful progress was made, offer to update it and note the date. Keep "What's Done", "What's Next", and "Blockers" accurate — these are read by a fresh Claude instance with no other context. (In Obsidian — see ## Notes.)

## Notes
Project notes live in Obsidian:
`/Users/davewyborn/Documents/2_Obsidian/KingdomOfGodWorkingNotes/1. Wants/10 - Scripture Scribbles/`
Filenames: `Scripture Scribbles - PROJECT_SUMMARY.md` and `Scripture Scribbles - DECISIONS.md`
