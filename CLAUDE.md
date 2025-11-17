# Scripture Scribbles - Project Context

## Project Overview

**Scripture Scribbles** is a dyslexia-friendly, local-first Bible study tool with rich annotations and sermon notes.

**Live:** https://scripturescribbles.co.uk
**GitHub:** https://github.com/DaveWyborn/scripture-scribbles
**License:** MIT (open source)

## Core Mission

Make Bible study accessible and enjoyable for people with dyslexia, while creating a powerful tool for all Christians.

**Key differentiators:**
- Dyslexia-friendly (OpenDyslexic font, full color control, audio reader)
- Margin annotations (clean text, expandable details)
- Flexible highlighting (word + verse level)
- Fair pricing (auto-downgrade, Christian values)
- Beautiful, modern design (Cava-inspired)

## Current Version: v1.0.0 (LIVE)

**Architecture:**
- 100% client-side single HTML file
- File System Access API (Chrome/Edge/Brave only - desktop)
- JSON annotations stored separately from Bible markdown
- Auto-save (500ms debounced)
- No accounts, no server (currently)

**Features:**
- 6-color highlighting
- Verse notes with detailed text
- Verse tags
- Multiple annotation sets (Study, Church, Home Group, Personal)
- View modes: Reading, Study, Church, Custom
- Dark mode
- Font size control
- Collapsible toolbar (mobile-friendly)
- Bug report system (Formspree: mblqkwye)

## v1.1.0 - In Development

**Major changes:**
- **Server storage** (Supabase) - Sync across devices
- **User accounts** - Sign up/sign in
- **WEB Bible embedded** - Use instantly, no folder setup
- **Mobile support** - Works on iOS/Android (IndexedDB)
- **Visual navigation** - Grid-based book/chapter selector

**See:** `scripture-scribbles-v1.1-plan.md` for full plan

## Key Files

**Application:**
- `index.html` - Landing page
- `scripture-scribbles-reader.html` - Main application
- `bible-viewer-prototype.html` - Early prototype (reference only)

**Bible Data:**
- `WEB/` - World English Bible (public domain, markdown)
- 7MB, 66 books, full Bible text

**Documentation:**
- `README.md` - Project overview
- `LICENSE` - MIT license
- `DEPLOYMENT.md` - Deployment guide
- `SUPABASE-SETUP-GUIDE.md` - Database setup instructions

**Design & Planning:**
- `scripture-scribbles-design-vision.md` - Complete design vision
- `ideas.md` - Original vision document
- `bible_view.png` - UI reference screenshot
- `scripture-scribbles-v1.1-plan.md` - v1.1.0 roadmap
- `scripture-scribbles-v1.1-tasks.md` - Development tasks
- `scripture-scribbles-feature-ideas.md` - Future features
- `scripture-scribbles-ui-improvements.md` - UI enhancement plans
- `scripture-scribbles-storage-strategy.md` - Storage architecture analysis
- `scripture-scribbles-word-level-annotations.md` - Cross-version annotation strategy

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

**Current (v1.0.0):**
- Vanilla JavaScript
- File System Access API
- localStorage for settings
- GitHub Pages hosting

**v1.1.0 (adding):**
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security for data protection
- Email/password + Google OAuth
- IndexedDB for browser storage (fallback)

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

## Roadmap

**v1.1.0 (Current):**
- Supabase authentication + sync
- WEB Bible embedded
- Visual navigation
- Mobile support
- Click-to-select verses

**v1.2.0:**
- Sermon notes feature
- Font selection (OpenDyslexic)
- Full color customization
- 6 themes (3 light, 3 dark)
- Margin annotation design

**v1.3.0:**
- Audio reader (AI voice API)
- Usage-based pricing
- Fair auto-downgrade system
- Premium features

**v2.0.0:**
- Additional Bible versions
- Cross-version annotation shadows
- Advanced search
- Collaboration features
- Native mobile apps

## Key Decisions

**Storage:** Server-first (Supabase), not privacy-first
- Users expect sync in 2025
- Browser storage too fragile
- Free tier supports 10k users
- Clear revenue path via premium

**Design:** Dyslexia-focused, not just "another Bible app"
- OpenDyslexic font support
- Full color/font control
- Audio reader option
- Reduced visual clutter

**Pricing:** Fair and Christian
- Free tier forever (all core features)
- Premium for convenience (sync, audio)
- Auto-downgrade if usage drops
- Auto-pause if inactive
- No dark patterns

**Navigation:** Visual grid (e-Sword style)
- No typing needed (dyslexia-friendly)
- Mobile-friendly (large touch targets)
- Color-coded books
- Context-aware (only valid chapters/verses)

## Current Status

**v1.0.0:** Live and functional
**v1.1.0:** In planning/development
**Next tasks:**
1. Dave: Set up Supabase
2. Claude: Integrate Supabase auth
3. Claude: Build visual navigation
4. Claude: Implement sync
5. Both: Test and iterate

**Blockers:** None
**Timeline:** ~3-4 sessions to v1.1.0

## Contact & Support

**Developer:** Dave Wyborn
**Email:** (via bug report form)
**GitHub Issues:** https://github.com/DaveWyborn/scripture-scribbles/issues
**Formspree:** mblqkwye (bug reports)
