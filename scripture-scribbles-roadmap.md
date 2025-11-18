# Scripture Scribbles - Complete Roadmap

## Vision

**Dyslexia-friendly Bible study tool** with rich annotations, sermon notes, and fair pricing.

**Core values:**
- Accessibility first (designed for dyslexia)
- Fair pricing (auto-downgrade, Christian values)
- Privacy-respecting where possible
- Beautiful, modern design (Cava-inspired)

---

## Current Status

### v1.0.0 (Live)
- ✅ File System Access API (Chrome desktop only)
- ✅ Local Bible markdown files
- ✅ Basic annotations (highlights, notes, tags)
- ✅ Dark mode
- ✅ Font size controls
- ❌ Limited to desktop Chrome users
- ❌ High barrier to entry (folder setup)

### v1.1.0 Prototype (In Progress)
- ✅ Supabase authentication
- ✅ Embedded WEB Bible (Genesis 1-3)
- ✅ Annotations sync to cloud
- ✅ Works on all devices (mobile + desktop)
- ✅ Zero setup required
- ⏳ Need remaining 63 books
- ⏳ Need visual navigation
- ⏳ Need full feature set from v1.0.0

---

## Version Roadmap

### v1.1.0 - Public Launch (Core Features)
**Goal:** "Open and use instantly on any device"

**Must have:**
- [x] Supabase auth (sign up, sign in, sign out)
- [x] Embedded WEB Bible (all 66 books)
- [x] Cloud sync for annotations
- [x] Mobile support (iOS, Android)
- [ ] Visual navigation (grid book/chapter selector - from ideas.md)
- [ ] Annotation display modes: On / Subtle / Off (from ideas.md)
- [ ] Basic annotation features:
  - [x] Verse highlights (6 colors)
  - [x] Notes
  - [x] Tags with colors
  - [ ] Word-level highlighting (from ideas.md)
- [ ] Settings panel:
  - [ ] Dark mode toggle
  - [ ] Font size controls
  - [ ] Theme selector (start with 1 light, 1 dark)
- [ ] Multiple annotation sets (Study, Church, Personal)
- [ ] Export annotations (JSON download)

**Nice to have:**
- [ ] PWA installation (works offline)
- [ ] Welcome tutorial overlay
- [ ] Keyboard shortcuts

**Timeline:** 2-3 weeks

---

### v1.2.0 - Dyslexia Features
**Goal:** "Make Bible reading accessible for dyslexia"

**Typography features (from ideas.md):**
- [ ] Font selection (4-5 options):
  - [ ] OpenDyslexic (primary)
  - [ ] Atkinson Hyperlegible
  - [ ] System serif
  - [ ] System sans-serif
- [ ] Font controls:
  - [ ] Size slider (12px - 32px+)
  - [ ] Bold toggle
  - [ ] Line height adjustment
  - [ ] Letter spacing adjustment

**Color features (from ideas.md):**
- [ ] Full color customization:
  - [ ] Background color picker
  - [ ] Text color picker
  - [ ] Annotation color picker
- [ ] 6 built-in themes:
  - [ ] 3 light themes (High Contrast, Cream, Sepia)
  - [ ] 3 dark themes (True Black, Dark Grey, Blue-Black)
- [ ] Dyslexia-optimized themes:
  - [ ] Yellow on black
  - [ ] Cream on dark blue
- [ ] Consider Catppuccin palette

**Annotation improvements (from ideas.md):**
- [ ] Margin icons for notes/tags (collapsed view)
- [ ] Click verse to expand notes/tags below
- [ ] Edit/delete icons on hover
- [ ] Annotation visibility modes:
  - [ ] On: Full color in margins
  - [ ] Subtle: Greyscale, highlights → underlines
  - [ ] Off: Hidden entirely

**Timeline:** 2-3 weeks

---

### v1.3.0 - Sermon Notes
**Goal:** "Capture sermon notes alongside Bible reading"

**Sermon notes features (from ideas.md):**
- [ ] Side-by-side view (desktop: Bible + Notes)
- [ ] Swipe left/right (mobile: switch Bible ↔ Notes)
- [ ] Large clean text editor
- [ ] Markdown toolbar:
  - [ ] Headers (#, ##, ###)
  - [ ] Links ([[]])
  - [ ] Lists, bold, italic
- [ ] Sermon templates with YAML:
  - [ ] Speaker, date, location, series
  - [ ] Passage reference
- [ ] Quick add verse:
  - [ ] Select verse(s) in Bible
  - [ ] Click "Add to Notes"
  - [ ] Inserts formatted verse
- [ ] Verse formatting styles (user selectable):
  ```
  Style 1:
  Rom 1:6 (WEB)
  "In Whom you also are called of Jesus Christ:"

  Style 2:
  "In Whom you also are called of Jesus Christ:"
  Rom 1:6 (WEB)
  ```
- [ ] Continuous scroll navigation:
  - [ ] Scroll past bottom → loads next chapter
  - [ ] Prevents confusion with swipe gesture

**Timeline:** 3-4 weeks

---

### v1.4.0 - Advanced Highlighting
**Goal:** "Flexible word + verse highlighting with smart merging"

**Word-level highlighting (from ideas.md):**
- [ ] Select individual words to highlight
- [ ] 6+ colors available
- [ ] Smart merge rules:
  - [ ] Word highlight + verse highlight (different colors) → both remain
  - [ ] Word highlight + verse highlight (same color) → merge into verse
  - [ ] Clear verse → word highlights remain
  - [ ] Clear word → adopts verse highlight if exists
- [ ] Clear behavior:
  - [ ] "Clear verse highlight" with only word highlights → clears words
  - [ ] "Clear verse highlight" with both → clears verse only (click again for words)

**Timeline:** 2 weeks

---

### v1.5.0 - Audio Reader (Premium Feature)
**Goal:** "Listen to Bible with AI voice"

**Audio features (from ideas.md):**
- [ ] High-quality AI voice API integration
- [ ] Playback controls (play, pause, speed)
- [ ] Follow along (auto-scroll with audio)
- [ ] Verse-level navigation

**Pricing tiers (from ideas.md):**
- [ ] Free tier:
  - [ ] Basic voice quality
  - [ ] 30 min/day average
  - [ ] Flexible limit (can go to 45 min some days)
  - [ ] Smart cutoff (finish chapter, not mid-verse)
- [ ] Premium tiers:
  - [ ] 45 min/day
  - [ ] 60 min/day
  - [ ] Unlimited

**Fair pricing implementation (from ideas.md):**
- [ ] Rolling 7-day average (not hard daily limit)
- [ ] Upgrade prompts when averaging over limit:
  ```
  "You're averaging 45 minutes per day. Current plan: 30 minutes. Upgrade?"
  - For today only
  - For this week
  - Permanent upgrade
  - No thank you
  ```
- [ ] Auto-downgrade after 3 months low usage:
  ```
  "Your usage has dropped to 10 min/day average.
   We're downgrading you from 45 min to 30 min plan.
   You'll save $X/month. Notify us if you disagree."
  ```
- [ ] Auto-pause after 3 months inactive:
  ```
  "You haven't used the app in 3 months.
   We're pausing your subscription to save you money.
   Restart anytime with one click."
  ```

**Timeline:** 3-4 weeks

---

### v1.6.0 - Home Screen & Navigation
**Goal:** "Clear, simple navigation and management"

**Home screen (from ideas.md):**
- [ ] Clean layout with main options:
  - [ ] Theme selector
  - [ ] Settings
  - [ ] Tags manager (create/edit/delete tags)
  - [ ] Bible Reader
  - [ ] Sermon Notes:
    - [ ] New sermon note
    - [ ] Open existing
    - [ ] Load template

**Visual navigation (from ideas.md - see screenshots):**
- [ ] Grid-based book selector:
  - [ ] Old Testament / New Testament sections
  - [ ] Book cards with:
    - [ ] Book name
    - [ ] Number of chapters
    - [ ] Last read indicator
- [ ] Chapter selector:
  - [ ] Grid of chapter numbers
  - [ ] Visual progress (chapters with annotations)
  - [ ] Quick jump
- [ ] Optional verse selector (for specific contexts)

**Timeline:** 2 weeks

---

## Technical Priorities

### Immediate (v1.1.0)
1. Convert all 66 books to JSON
2. Build visual navigation (grid book/chapter selector)
3. Port all v1.0.0 features to v1.1.0
4. Add multiple annotation sets

### Short-term (v1.2.0 - v1.3.0)
1. Implement theme system
2. Add font/color controls
3. Build sermon notes editor
4. Margin annotation layout

### Long-term (v1.4.0+)
1. Word-level highlighting engine
2. Audio API integration
3. Subscription/billing system
4. Tag management system

---

## Design Philosophy

**From ideas.md:**
- **Dyslexia-first:** Every design decision considers text processing difficulty
- **Fair pricing:** Christian values, not exploitative, auto-downgrade
- **Clean & simple:** Reduce choices, clear hierarchy
- **Mobile-friendly:** Touch-first on mobile, works great on desktop too
- **Margin annotations:** Keep text clean, expand on demand
- **Flexible & forgiving:** Users can experiment without commitment

**Design system:**
- Cava-inspired (clean, modern, accessible)
- 6 themes (3 light, 3 dark)
- Consistent spacing, typography, colors
- Mobile-first, responsive

---

## Success Metrics

**v1.1.0 launch:**
- [ ] 1000+ users in first month
- [ ] 50%+ mobile users (proves accessibility)
- [ ] <5% support requests (proves intuitive)

**v1.3.0 (sermon notes):**
- [ ] 30%+ users create sermon notes
- [ ] Average 2+ sermons per active user

**v1.5.0 (audio):**
- [ ] 10%+ conversion to premium
- [ ] Revenue covers API costs + 20% margin
- [ ] 5%+ donated to charity

---

## Open Questions

1. **Bible versions:** Should we add more translations? (NIV, ESV cost money)
2. **Collaboration:** Should users share notes/studies? (privacy concern)
3. **Obsidian export:** Still relevant with cloud sync?
4. **Native apps:** Or is PWA enough?
5. **Offline mode:** Essential or nice-to-have?

---

## Next Actions

**For v1.1.0 completion:**
1. Convert WEB Bible (all 66 books) to JSON
2. Build visual navigation UI
3. Add annotation visibility modes (On/Subtle/Off)
4. Implement multiple annotation sets
5. Port settings from v1.0.0
6. Add export feature
7. Test on mobile devices
8. Deploy to scripturescribbles.co.uk

**Estimated:** 2-3 weeks to complete v1.1.0
