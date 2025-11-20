# Scripture Scribbles - Progress Report

**Last Updated:** 20 November 2024
**Current Version:** v1.1.0 ✅ LIVE

---

## ✅ v1.1.0 - COMPLETE & DEPLOYED

### What We Built

**Core Infrastructure:**
- ✅ Supabase authentication (sign up, sign in, sign out)
- ✅ Cloud sync for all annotations
- ✅ Row-level security (users only see their data)
- ✅ Embedded WEB Bible (all 66 books, 31,102 verses)
- ✅ Mobile support (iOS, Android, all modern browsers)
- ✅ PWA-ready (can be installed on mobile)

**Navigation:**
- ✅ Visual navigation modal (grid-based book/chapter selector)
- ✅ Testament sections (OT/NT)
- ✅ Previous/Next chapter buttons
- ✅ Click chapter info to open navigator

**Annotation Features:**
- ✅ Verse highlights (6 colors: yellow, green, blue, pink, purple, orange)
- ✅ Verse underlines (6 colors - bonus feature)
- ✅ Notes (expandable textarea with Cmd/Ctrl+Enter save)
- ✅ Tags with custom colors
- ✅ Tag suggestions (previously used tags)
- ✅ Inline annotation menu (appears when verse selected)
- ✅ Copy verse to clipboard
- ✅ Auto-contrast text on highlights (dark text on light colors, light on dark)

**Annotation Sets:**
- ✅ Multiple annotation sets (Study, Church, Personal - user customizable)
- ✅ Create/delete/switch between sets
- ✅ Set switcher in toolbar
- ✅ Cannot delete last set (protection)

**Export Features:** (🎉 Just completed!)
- ✅ Export notes to Markdown
  - ✅ Book selection interface
  - ✅ Verse counting with running total
  - ✅ Bible order sorting (Genesis → Revelation)
  - ✅ Formatted output (verse text, highlights, tags, notes)
  - ✅ 250-verse limit (ready for commercial versions)
  - ✅ Licence warnings (hidden for WEB, ready for future)
- ✅ Export full backup to JSON
  - ✅ Complete data dump
  - ✅ No verse limits
  - ✅ Includes metadata

**Themes:** (🚀 Exceeded expectations!)
- ✅ 24 themes total (way more than planned!)
  - ✅ High Contrast (Light/Dark) - WCAG AAA
  - ✅ Dyslexia themes (Light/Dark)
  - ✅ GitHub themes (Light/Dark)
  - ✅ Paper, Nord, Monokai, Gruvbox, Ocean Deep, Twilight, Sunset, Luxury
  - ✅ Clean, Warm, True Dark, Slate
- ✅ Theme-aware tag colors (pastel for light, saturated for WCAG)
- ✅ Persistent theme selection

**Display Modes:**
- ✅ Annotation visibility modes:
  - ✅ On: Full color highlights + indicators
  - ✅ Subtle: Greyscale indicators, highlights become underlines
  - ✅ Off: All annotations hidden (reading mode)
- ✅ Smooth transitions between modes
- ✅ Icons show tags/notes when present

**Settings Panel:**
- ✅ Hamburger menu (mobile-friendly)
- ✅ Theme selector link
- ✅ Annotation mode toggle
- ✅ Bug report link (GitHub issues)
- ✅ Export notes option
- ✅ User info (logged in as...)
- ✅ Sign in/out buttons

**Polish & UX:**
- ✅ Auto-save (debounced 500ms)
- ✅ Smooth animations and transitions
- ✅ Copy feedback toast
- ✅ Mobile-optimized touch targets
- ✅ Responsive design (works on all screen sizes)
- ✅ Clean, modern UI (Cava-inspired)
- ✅ Loading states and error handling

### What We Didn't Build (v1.1.0)
- ❌ Welcome tutorial overlay (not essential)
- ❌ Keyboard shortcuts (future enhancement)
- ❌ Full PWA offline mode (online-first acceptable)

### Beyond Original Plan
We actually exceeded the v1.1.0 plan:
- 🚀 24 themes (planned 6)
- 🚀 Underlines in addition to highlights
- 🚀 Annotation display modes (On/Subtle/Off)
- 🚀 Export to Markdown (planned for later)
- 🚀 Auto-contrast on highlights
- 🚀 Tag color customization
- 🚀 Inline annotation menu (cleaner than panel)

---

## 📋 Roadmap Overview

### ✅ v1.0.0 (Archived)
Local-only, File System Access API, Chrome desktop only
**Status:** Replaced by v1.1.0

### ✅ v1.1.0 (LIVE) - Public Launch
Cloud sync, embedded Bible, mobile support, export
**Status:** COMPLETE & DEPLOYED

### 🎯 v1.2.0 - Dyslexia Features (Next)
**Goal:** "Make Bible reading accessible for dyslexia"

**Planned:**
- [ ] Font selection:
  - [ ] OpenDyslexic
  - [ ] Atkinson Hyperlegible
  - [ ] System fonts
- [ ] Typography controls:
  - [ ] Font size slider (currently fixed)
  - [ ] Bold toggle
  - [ ] Line height adjustment
  - [ ] Letter spacing adjustment
- [ ] Full color customization:
  - [ ] Background color picker
  - [ ] Text color picker
  - [ ] Custom annotation colors
- [ ] Dyslexia-optimized color schemes:
  - [ ] Yellow on black
  - [ ] Cream on dark blue

**Already Done from v1.2.0:**
- ✅ 24 themes (exceeded the 6 planned)
- ✅ Annotation display modes (On/Subtle/Off)
- ✅ Margin indicators for notes/tags

**Estimate:** 2-3 weeks

---

### 🔮 v1.3.0 - Sermon Notes
**Goal:** "Capture sermon notes alongside Bible reading"

**Planned:**
- [ ] Side-by-side view (Bible + Notes on desktop)
- [ ] Swipe navigation (mobile: switch Bible ↔ Notes)
- [ ] Markdown editor with toolbar
- [ ] Sermon templates (speaker, date, series, passage)
- [ ] Quick add verse to notes
- [ ] Multiple verse formatting styles
- [ ] Continuous scroll (auto-load next chapter)
- [ ] Export sermon notes to Markdown

**Already Done:**
- ✅ Export notes to Markdown (foundation ready)

**Estimate:** 3-4 weeks

---

### 🔮 v1.4.0 - Advanced Highlighting
**Goal:** "Word-level highlighting with smart merging"

**Planned:**
- [ ] Select individual words to highlight
- [ ] 6+ colors for word highlights
- [ ] Smart merge rules:
  - [ ] Word + verse highlights coexist
  - [ ] Same color → merge into verse highlight
  - [ ] Clear verse → word highlights remain
- [ ] Multi-level clear behavior

**Estimate:** 2 weeks

---

### 🔮 v1.5.0 - Audio Reader (Premium)
**Goal:** "Listen to Bible with AI voice"

**Planned:**
- [ ] AI voice integration
- [ ] Playback controls (play, pause, speed)
- [ ] Auto-scroll with audio
- [ ] Fair pricing model:
  - [ ] Free: 30 min/day rolling average
  - [ ] Premium: 45/60/unlimited tiers
  - [ ] Auto-downgrade after low usage
  - [ ] Auto-pause after inactivity
  - [ ] Christian values (no dark patterns)

**Estimate:** 3-4 weeks

---

### 🔮 v1.6.0 - Multiple Bible Versions & Paid Tier
**Goal:** "Access multiple translations with fair pricing"

**Planned:**

**Free Tier (Public Domain Bibles):**
- [ ] Add ASV, KJV, YLT, Darby, BBE
- [ ] Version selector in settings
- [ ] Unlimited export for public domain versions
- [ ] 250 verse export limit (preparation for premium)

**Premium Tier (£5/month or £50/year):**
- [ ] Licensed Bible APIs (NIV, ESV, NASB, NKJV, NLT)
- [ ] 500 verse export limit (max under most licenses)
- [ ] User-to-user sharing enabled
- [ ] Stripe payment integration
- [ ] Grace period on lapsed subscription

**User-to-User Sharing (Premium):**
- [ ] Make annotation sets public
- [ ] Browse community library
- [ ] Import others' notes
- [ ] Auto-convert to public domain for free users
- [ ] Attribution system

**Export Compliance:**
- [ ] Show Bible version in export
- [ ] Enforce verse limits per version
- [ ] License warnings for commercial versions
- [ ] "Switch to public domain" option

**Technical:**
- [ ] Subscription table (tier, status, dates)
- [ ] API key storage (encrypted)
- [ ] Usage tracking
- [ ] Public sets table
- [ ] Import history

**Estimate:** 4-5 weeks

---

### 🔮 v1.7.0 - Home Screen & Tag Management
**Goal:** "Organized home screen with tag manager"

**Planned:**
- [ ] Home screen with main options
- [ ] Bible version selector
- [ ] Tag manager (create/edit/delete/merge)
- [ ] Sermon notes list
- [ ] Community browser
- [ ] Recent annotations
- [ ] Tag usage statistics

**Estimate:** 2 weeks

---

## 🎯 Immediate Next Steps

### For v1.2.0 (Dyslexia Features)
1. Add font selector dropdown (OpenDyslexic, Atkinson, system)
2. Build typography controls panel:
   - Font size slider
   - Bold toggle
   - Line height slider
   - Letter spacing slider
3. Add color customization:
   - Background picker
   - Text picker
   - Annotation color customizer
4. Create dyslexia-optimized presets

### Quick Wins
- [ ] Add loading spinner on sign in
- [ ] Add "Forgot password" link
- [ ] Improve error messages
- [ ] Add email verification flow
- [ ] Create welcome email template

---

## 📊 Success Metrics (To Track)

**v1.1.0 Goals:**
- [ ] 1000+ users in first month
- [ ] 50%+ mobile users
- [ ] <5% support requests

**Current Status:**
- Users: TBD (just launched)
- Mobile %: TBD
- Support requests: 0

---

## 🤔 Open Questions

1. **Bible Versions:** ✅ RESOLVED - v1.6.0 planned
   - Free tier: Multiple public domain versions
   - Premium tier: Licensed versions via API
   - Export compliance built in
   - User-to-user sharing with auto-conversion

2. **Pricing Model:**
   - £5/month or £50/year reasonable?
   - Alternative: Pay-per-Bible (£2/month per licensed version)?
   - Lifetime option? (£150-200 one-time)
   - Family plan? (£8/month for 5 users)

3. **API Costs:**
   - ESV API: Free tier (500 queries/day), paid after
   - API.Bible: Free tier limited, commercial tiers available
   - Need to calculate: API cost per user per month
   - Ensure £5/month covers API costs + margin

4. **Collaboration:** ✅ RESOLVED - Premium feature in v1.6.0
   - User-to-user sharing enabled
   - Auto-conversion for free users
   - Attribution system
   - Community library

5. **Offline Mode:**
   - Currently requires internet
   - Bible data ~7MB (cacheable)
   - Service worker needed
   - Priority: Medium (nice-to-have for v1.7.0+)

6. **Native Apps:**
   - PWA works on iOS/Android
   - Native apps = more maintenance
   - Wait for user demand
   - Priority: Low (PWA sufficient for now)

7. **License Compliance:**
   - 500 verses = max under most commercial licenses
   - Need legal review of terms for NIV/ESV/etc.
   - User agreement must state license terms
   - Sermon sharing = personal use (allowed)
   - Large exports = potential violation (enforce limits)

---

## 💡 Future Ideas (Beyond Roadmap)

**From brainstorming:**
- Cross-references (click verse → see related passages)
- Study plans (daily reading guides)
- Share annotation sets (publish to community)
- Verse memorization mode
- Study groups (collaborative notes)
- Verse of the day
- Search across annotations
- Timeline view (chronological reading)
- Original languages (Greek/Hebrew tooltips)

**Criteria for prioritization:**
- Aligns with dyslexia-first mission?
- Serves sermon note-takers?
- Fair/ethical implementation possible?
- Low maintenance burden?

---

## 🎉 Key Achievements

**What makes Scripture Scribbles special:**

1. **Dyslexia-focused from day one**
   - 24 themes with accessibility options
   - Annotation display modes
   - Clean, distraction-free reading

2. **Mobile-first**
   - Touch-optimized interface
   - Works everywhere (not just Chrome desktop)
   - Visual navigation (no typing needed)

3. **Fair & transparent**
   - Free tier is genuinely useful
   - No dark patterns
   - Open source (MIT license)

4. **Well-architected**
   - Clean separation: Bible data vs annotations
   - Scalable (Supabase + PostgreSQL)
   - Secure (Row Level Security)

5. **Exceeded expectations**
   - Launched with more than planned
   - High polish for v1.1.0
   - Export feature complete

---

## 📅 Timeline Estimate

**v1.2.0 (Dyslexia Features):** January 2025
**v1.3.0 (Sermon Notes):** February 2025
**v1.4.0 (Word Highlighting):** March 2025
**v1.5.0 (Audio Reader):** April 2025
**v1.6.0 (Bible Versions & Paid Tier):** May-June 2025
**v1.7.0 (Home Screen & Tags):** July 2025

**Pace:** ~1 version per month (sustainable for solo dev)
**Note:** v1.6.0 is larger (4-5 weeks) due to payment integration

---

## 🙏 Reflection

v1.1.0 is a **massive achievement**:
- From local-only to cloud sync
- From Chrome-only to universal
- From folder setup to zero setup
- From basic to feature-rich

**What's working:**
- Clean architecture decisions
- Incremental delivery
- Focus on core use case (Bible study + sermon notes)

**What's next:**
- Make it even more accessible (dyslexia features)
- Add sermon notes (primary use case)
- Keep it simple and focused

---

**Made with ❤️ for the body of Christ**
