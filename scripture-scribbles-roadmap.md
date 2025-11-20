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
- ✅ Embedded WEB Bible (all 66 books)
- ✅ Annotations sync to cloud
- ✅ Works on all devices (mobile + desktop)
- ✅ Zero setup required
- ✅ Visual navigation (modal with book/chapter grids)
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
- [x] Visual navigation (modal with book/chapter grids)
- [x] Basic annotation features:
  - [x] Verse highlights (6 colors)
  - [x] Verse underlines (6 colors - bonus)
  - [x] Notes
  - [x] Tags with colors
  - [x] Inline annotation menu
  - [x] Copy verse to clipboard
- [x] Settings panel:
  - [x] Theme selector (24 themes - exceeded plan)
- [ ] Annotation display modes: On / Subtle / Off
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

### v1.6.0 - Multiple Bible Versions & Paid Tier
**Goal:** "Access multiple Bible translations with fair pricing"

**Public Domain Bibles (Free):**
- [ ] Add support for multiple public domain versions:
  - [ ] American Standard Version (ASV)
  - [ ] King James Version (KJV)
  - [ ] Young's Literal Translation (YLT)
  - [ ] Darby Translation (DARBY)
  - [ ] Basic English Bible (BBE)
  - [ ] Webster's Bible (WEB)
- [ ] Version selector in settings
- [ ] Annotations tied to Bible version
- [ ] Export format includes version reference
- [ ] Free users: unlimited verses from public domain Bibles

**Premium Licensed Bibles (Paid Tier):**
- [ ] API integration for licensed versions:
  - [ ] NIV (via API.Bible or similar)
  - [ ] ESV (via ESV API)
  - [ ] NASB, NKJV, NLT, etc.
- [ ] Per-user API key management
- [ ] Usage tracking per version
- [ ] Fallback to public domain if API fails

**Paid Tier Features:**
- [ ] Subscription tiers:
  - [ ] Free: Public domain Bibles only, 250 verse export limit
  - [ ] Premium: £5/month or £50/year
    - [ ] Access to all licensed Bibles (NIV, ESV, etc.)
    - [ ] 500 verse export limit (max under most licenses)
    - [ ] User-to-user sharing enabled
- [ ] Stripe integration for payments
- [ ] Grace period (14 days after subscription lapses)
- [ ] Auto-downgrade to public domain if cancelled

**User-to-User Sharing (Premium Feature):**
- [ ] Make annotation sets public:
  - [ ] User clicks "Make Public" on annotation set
  - [ ] Generates shareable link
  - [ ] Set appears in community library
- [ ] Import other users' notes:
  - [ ] Browse public annotation sets
  - [ ] Preview before import
  - [ ] One-click import to your account
- [ ] License handling for imports:
  - [ ] Premium user imports premium notes → works as-is
  - [ ] Free user imports premium notes → auto-convert to public domain Bible
  - [ ] Show warning: "This uses NIV. Converting to WEB for free tier."
- [ ] Attribution:
  - [ ] Original author credited
  - [ ] "Imported from @username" tag
  - [ ] Link back to original if public

**Export License Compliance:**
- [ ] Update export modal to show:
  - [ ] Current Bible version
  - [ ] Verse limit for that version (250/500)
  - [ ] License warning for commercial versions
  - [ ] "Switch to WEB" for unlimited export
- [ ] Premium users:
  - [ ] 500 verse limit for NIV/ESV/etc.
  - [ ] Unlimited for public domain
- [ ] Free users:
  - [ ] 250 verse limit (prepare for future premium versions)
  - [ ] Unlimited for public domain

**Technical Implementation:**
- [ ] Version field in annotations table (already exists: `bible_version`)
- [ ] User subscription table (tier, status, start_date, end_date)
- [ ] API key storage (encrypted, per-version)
- [ ] Usage tracking (API calls per version per user)
- [ ] Public sets table (user_id, set_name, version, description, downloads)
- [ ] Import history (who imported what, when)

**Timeline:** 4-5 weeks

---

### v1.7.0 - Home Screen & Tag Management
**Goal:** "Clear, simple navigation and management"

**Home screen:**
- [ ] Clean layout with main options:
  - [ ] Theme selector
  - [ ] Bible version selector
  - [ ] Settings
  - [ ] Tags manager (create/edit/delete tags)
  - [ ] Bible Reader
  - [ ] Sermon Notes:
    - [ ] New sermon note
    - [ ] Open existing
    - [ ] Load template
  - [ ] Community (browse public sets)

**Tag Manager:**
- [ ] View all tags across all sets
- [ ] Edit tag colors globally
- [ ] Merge duplicate tags
- [ ] Delete unused tags
- [ ] Tag usage statistics

**Timeline:** 2 weeks

---

### General Improvements (Ongoing)
**Goal:** "Polish and professionalism"

**Branding:**
- [ ] Logo design (icon + wordmark)
- [ ] Favicon
- [ ] App icon (PWA)
- [ ] Social media images (Open Graph)
- [ ] Email templates branding

**Email System:**
- [ ] Welcome email (branded)
- [ ] Email verification template
- [ ] Password reset template
- [ ] Subscription confirmation
- [ ] Payment receipts
- [ ] Feature announcements

**Design Improvements:**
- [ ] Loading states (skeletons)
- [ ] Empty states (no annotations yet)
- [ ] Error states (failed to load)
- [ ] Success animations
- [ ] Micro-interactions
- [ ] Accessibility audit (WCAG AA)

**Theme Updates:**
- [ ] Theme preview before selection
- [ ] Custom theme creator
- [ ] Import/export themes
- [ ] Community themes
- [ ] Seasonal themes (Christmas, Easter)

**Performance:**
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Bundle size reduction
- [ ] Performance monitoring

**Timeline:** Ongoing, small improvements each release

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
