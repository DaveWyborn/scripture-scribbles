# Scripture Scribbles - Complete Roadmap

## Vision

**Dyslexia-friendly Bible study tool** with rich annotations, sermon notes, fair pricing, and a mission to fund Bible translation.

**Core values:**
- Accessibility first (designed for dyslexia)
- Beautiful reading experience (natural, fluid, calming)
- Fair pricing (transparent, charitable)
- Mission-driven (supporting Bible translation)
- Privacy-respecting where possible

---

## Current Status

### v1.1.0 (LIVE) ✅
- ✅ Supabase authentication
- ✅ Embedded WEB Bible (all 66 books)
- ✅ Cloud sync for annotations
- ✅ Works on all devices (mobile + desktop)
- ✅ Zero setup required
- ✅ Visual navigation (modal with book/chapter grids)
- ✅ Basic annotation features:
  - ✅ Verse highlights (6 colours)
  - ✅ Verse underlines (6 colours)
  - ✅ Notes
  - ✅ Tags with custom colours
  - ✅ Inline annotation menu
  - ✅ Copy verse to clipboard
- ✅ Settings panel with 24 themes
- ✅ Annotation display modes (On / Subtle / Off)
- ✅ Multiple annotation sets (Study, Church, Personal)
- ✅ Export annotations (Markdown + JSON)
- ✅ Interactive roadmap with voting
- ✅ "Why We Exist" page

---

## Version Roadmap

### v1.2.0 - Beautiful Reading Experience & Multiple Bibles
**Goal:** "Natural, fluid reading with multiple Bible versions"

**Reading Experience:**
- [ ] Fluid reading mode (USFM with paragraphs and headings)
  - [ ] Convert WEB, ASV, KJV from USFM to enhanced JSON
  - [ ] Section headings (styled, toggleable)
  - [ ] Natural paragraph flow
  - [ ] Verse numbers in margin or superscript (toggleable)
- [ ] Beautiful animations
  - [ ] Smooth page transitions
  - [ ] Gentle fade-ins for text
  - [ ] Subtle scroll animations
  - [ ] Progress indicators
- [ ] Focus mode enhancements
  - [ ] Optional background focus music (ambient, instrumental)
  - [ ] Distraction-free reading
  - [ ] Reading timer/progress
  - [ ] "Deep focus" mode (minimal UI)

**Multiple Bible Versions (Public Domain):**
- [ ] Add American Standard Version (ASV 1901)
- [ ] Add King James Version (KJV)
- [ ] Bible version selector in settings
- [ ] Annotations tied to version (cross-compatible)
- [ ] All versions support fluid reading mode

**Technical:**
- [ ] USFM → Enhanced JSON converter script
- [ ] Enhanced JSON structure:
  ```json
  {
    "type": "heading|paragraph",
    "level": 1,
    "text": "...",
    "verses": [...]
  }
  ```
- [ ] Rendering engine for paragraphs + headings
- [ ] Toggle: Verse-by-verse vs Reading mode

**Maintain Existing Features:**
- ✅ Verse highlights still work (in both modes)
- ✅ Notes and tags still work
- ✅ All annotation features preserved

**Timeline:** 3-4 weeks

---

### v1.3.0 - Dyslexia Features
**Goal:** "Make Bible reading accessible for dyslexia"

**Typography features:**
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

**Colour features:**
- [ ] Full colour customisation:
  - [ ] Background colour picker
  - [ ] Text colour picker
  - [ ] Annotation colour picker
- [ ] Dyslexia-optimised themes:
  - [ ] Yellow on black
  - [ ] Cream on dark blue
  - [ ] High contrast options

**Timeline:** 2-3 weeks

---

### v1.4.0 - Sermon Notes
**Goal:** "Capture sermon notes alongside Bible reading"

**Sermon notes features:**
- [ ] Side-by-side view (desktop: Bible + Notes)
- [ ] Swipe left/right (mobile: switch Bible ↔ Notes)
- [ ] Large clean text editor
- [ ] Markdown toolbar (headers, links, lists, bold, italic)
- [ ] Sermon templates with metadata:
  - [ ] Speaker, date, location, series
  - [ ] Passage reference
- [ ] Quick add verse:
  - [ ] Select verse(s) in Bible
  - [ ] Click "Add to Notes"
  - [ ] Inserts formatted verse
- [ ] Verse formatting styles (user selectable)
- [ ] Continuous scroll navigation (auto-load next chapter)
- [ ] Export sermon notes to Markdown

**Timeline:** 3-4 weeks

---

### v1.5.0 - Word-Level Highlighting
**Goal:** "Flexible word + verse highlighting with smart merging"

**Word-level highlighting:**
- [ ] Select individual words to highlight
- [ ] 6+ colours available
- [ ] Smart merge rules:
  - [ ] Word highlight + verse highlight (different colours) → both remain
  - [ ] Word highlight + verse highlight (same colour) → merge into verse
  - [ ] Clear verse → word highlights remain
  - [ ] Clear word → adopts verse highlight if exists
- [ ] Clear behaviour:
  - [ ] "Clear verse highlight" with only word highlights → clears words
  - [ ] "Clear verse highlight" with both → clears verse only (click again for words)

**Timeline:** 2 weeks

---

### v1.6.0 - Multiple Bible Versions & Paid Tier
**Goal:** "Access multiple translations with fair pricing"

**Free Tier (Public Domain Bibles - Local):**
- ✅ World English Bible (WEB)
- ✅ American Standard Version (ASV)
- ✅ King James Version (KJV)
- ✅ All with USFM paragraphs and headings
- ✅ Bundled locally (~21 MB)
- ✅ Always instant, works offline
- ✅ Unlimited annotations and exports

**Premium Tier (Licensed Bibles - API):**
- [ ] API integration (API.Bible or ESV API):
  - [ ] New International Version (NIV)
  - [ ] English Standard Version (ESV)
  - [ ] New American Standard Bible (NASB)
  - [ ] New Living Translation (NLT)
- [ ] Smart 500-verse rolling cache (license-compliant)
- [ ] Pre-fetch next chapters while reading
- [ ] Cache clears every 14 days (automatic)
- [ ] **Fallback to WEB** (critical for sermon use case):
  ```
  Loading Obadiah 1 (NIV)...
  [━━━━━━━━        ] 2s

  Connection slow?
  [Switch to WEB (instant) →]
  ```

**Pricing:**
- [ ] £5/month or £50/year
- [ ] 7-day free trial
- [ ] Stripe integration
- [ ] Subscription management

**Export Compliance:**
- [ ] Show Bible version in export
- [ ] Enforce verse limits per version (250 for WEB, 500 for licensed)
- [ ] License warnings for commercial versions
- [ ] "Switch to public domain" option for unlimited export

**Technical:**
- [ ] Subscription table (tier, status, dates)
- [ ] API key management
- [ ] Usage tracking
- [ ] 500-verse cache with rolling window
- [ ] Pre-fetch logic
- [ ] Fallback modal UI

**Timeline:** 4-5 weeks

---

### v1.7.0 - Audio Reader (Premium Feature)
**Goal:** "Listen to Bible with AI voice"

**Audio features:**
- [ ] High-quality AI voice API integration
- [ ] Playback controls (play, pause, speed)
- [ ] Follow along (auto-scroll with audio)
- [ ] Verse-level navigation
- [ ] Background playback (mobile)

**Pricing tiers:**
- [ ] Free tier:
  - [ ] Basic voice quality
  - [ ] 30 min/day average (rolling 7-day)
  - [ ] Flexible limit (can go to 45 min some days)
  - [ ] Smart cutoff (finish chapter, not mid-verse)
- [ ] Premium tiers:
  - [ ] 45 min/day (£3/month)
  - [ ] 60 min/day (£5/month)
  - [ ] Unlimited (£10/month)

**Fair pricing implementation:**
- [ ] Rolling 7-day average (not hard daily limit)
- [ ] Upgrade prompts when averaging over limit
- [ ] Auto-downgrade after 3 months low usage
- [ ] Auto-pause after 3 months inactive

**Timeline:** 3-4 weeks

---

### v1.8.0 - Home Screen & Tag Management
**Goal:** "Organised home screen with tag manager"

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
  - [ ] Community (browse public sets - if charity)

**Tag Manager:**
- [ ] View all tags across all sets
- [ ] Edit tag colours globally
- [ ] Merge duplicate tags
- [ ] Delete unused tags
- [ ] Tag usage statistics

**Timeline:** 2 weeks

---

### v2.0.0 - Charity Transition (When 10,000+ Users)
**Goal:** "Become a registered charity funding Bible translation"

**Charity Registration:**
- [ ] Recruit 2-3 trustees:
  - [ ] Church leader/theological advisor
  - [ ] Accessibility/dyslexia expert
  - [ ] Finance/business person
- [ ] Draft charity constitution
- [ ] Define charitable aims:
  - [ ] Make Bible accessible for dyslexic readers
  - [ ] Fund Bible translation through Wycliffe
  - [ ] Provide free access to Scripture
- [ ] Apply for CIO (Charitable Incorporated Organisation)
- [ ] Receive charity registration number
- [ ] Open charity bank account
- [ ] Set up charity accounting

**Wycliffe Partnership:**
- [ ] Contact Wycliffe Bible Translators
- [ ] Establish partnership agreement
- [ ] Choose partnership model:
  - [ ] Option 1: Direct donation (40% of revenue)
  - [ ] Option 2: Designated fund
  - [ ] Option 3: Sponsor specific translation project (recommended)
- [ ] Set up regular donations
- [ ] Receive impact reports for users

**Website Updates:**
- [ ] Add charity registration number
- [ ] Mission statement update:
  > "UK charity making Bible accessible for dyslexic readers while funding Bible translation for unreached people groups"
- [ ] Impact counter:
  - [ ] Users helped
  - [ ] Bible versions available
  - [ ] Amount donated to Wycliffe
  - [ ] Languages supported
- [ ] Donation options:
  - [ ] One-time donations
  - [ ] Monthly supporters (£3, £5, £10, £25/month)
  - [ ] Gift Aid checkbox (UK taxpayers +25%)
- [ ] Transparent reporting:
  - [ ] Quarterly impact reports
  - [ ] Published accounts
  - [ ] Clear breakdown of revenue allocation

**Premium Messaging Update:**
```
Premium: £5/month

✓ Modern Bible translations (NIV, ESV, NASB)
✓ Sermon notes and advanced features
✓ Cloud sync across all devices

40% of your subscription funds Bible translation through Wycliffe.

[Start 7-Day Free Trial]
```

**Publisher Approach (As Charity):**
- [ ] Contact Crossway (ESV)
- [ ] Contact Biblica (NIV)
- [ ] Contact Lockman Foundation (NASB)
- [ ] Present charity credentials:
  - [ ] Registered charity number
  - [ ] Mission statement
  - [ ] Wycliffe partnership
  - [ ] User numbers and growth
  - [ ] Financial transparency
- [ ] Request charitable licensing terms
- [ ] Negotiate better rates (like YouVersion)
- [ ] Potential for free/subsidized licensing

**Revenue Allocation (Example):**
- 40% → Wycliffe Bible Translators (Bible translation)
- 20% → Operations (API costs, hosting, accounting)
- 25% → Development (features, maintenance, salary)
- 10% → Marketing (growth, reach more people)
- 5% → Reserves (emergency fund, sustainability)

**New Revenue Streams:**
- [ ] Grant applications:
  - [ ] Dyslexia-focused charities
  - [ ] Christian foundations
  - [ ] Technology for good initiatives
- [ ] Church partnerships:
  - [ ] Churches sponsor free premium for members
  - [ ] £50-500/month per church
- [ ] Corporate sponsorship:
  - [ ] Christian businesses support mission
  - [ ] £1,000-10,000/year
- [ ] Crowdfunding campaigns (for specific features)

**Timeline:** 3-6 months (registration process)

**Prerequisites:**
- ✅ 10,000+ active users (proves sustainability)
- ✅ £2,000+/month revenue (proves viability)
- ✅ 6-12 months track record (proves commitment)
- ✅ Clear mission impact (users helped, stories)

---

## General Improvements (Ongoing)
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
- [ ] Image optimisation
- [ ] Bundle size reduction
- [ ] Performance monitoring

**Timeline:** Ongoing, small improvements each release

---

## Technical Priorities

### Immediate (v1.2.0)
1. Download WEB, ASV, KJV in USFM format
2. Write USFM → Enhanced JSON converter
3. Implement paragraph/heading rendering
4. Add reading mode toggle
5. Integrate background focus music
6. Polish animations and transitions

### Short-term (v1.3.0 - v1.5.0)
1. Implement dyslexia typography features
2. Build sermon notes editor
3. Add word-level highlighting engine
4. Margin annotation layout

### Medium-term (v1.6.0 - v1.7.0)
1. API integration for licensed Bibles
2. Smart caching + fallback system
3. Subscription/billing system (Stripe)
4. Audio API integration
5. Usage tracking and limits

### Long-term (v2.0.0+)
1. Charity registration process
2. Wycliffe partnership establishment
3. Publisher negotiations (charitable licensing)
4. Grant applications
5. Church/corporate partnerships

---

## Design Philosophy

**Reading Experience:**
- Beautiful, natural, fluid
- Animations feel gentle and purposeful
- Focus mode eliminates distractions
- Optional ambient music enhances concentration
- Reading should feel like a peaceful retreat

**From ideas.md:**
- **Dyslexia-first:** Every design decision considers text processing difficulty
- **Fair pricing:** Christian values, not exploitative, auto-downgrade
- **Clean & simple:** Reduce choices, clear hierarchy
- **Mobile-friendly:** Touch-first on mobile, works great on desktop too
- **Margin annotations:** Keep text clean, expand on demand
- **Flexible & forgiving:** Users can experiment without commitment

**Charity values (v2.0.0+):**
- **Mission-driven:** Making Bible accessible + funding translation
- **Transparent:** Published accounts, clear revenue allocation
- **Generous:** Free tier is genuinely useful, premium is optional
- **Impactful:** Every subscription serves readers here AND translators there

**Design system:**
- Cava-inspired (clean, modern, accessible)
- 24+ themes (light, dark, dyslexia-optimised)
- Consistent spacing, typography, colours
- Mobile-first, responsive
- Smooth animations, gentle transitions

---

## Success Metrics

**v1.2.0 launch (Reading Experience):**
- [ ] 80%+ users try reading mode
- [ ] 50%+ prefer reading mode over verse-by-verse
- [ ] <5% support requests about reading mode

**v1.6.0 (Paid Tier):**
- [ ] 5% conversion to premium (industry standard)
- [ ] 1,000 free users → 50 premium users
- [ ] £250/month revenue
- [ ] <2% churn rate

**6-Month Goals (Towards Charity):**
- [ ] 10,000 free users
- [ ] 500 premium users (5% conversion)
- [ ] £2,500/month revenue (£30k/year)
- [ ] Track record for charity application

**12-Month Goals:**
- [ ] 50,000 free users
- [ ] 2,500 premium users
- [ ] £12,500/month revenue (£150k/year)
- [ ] Charity registration complete

**v2.0.0 Goals (As Charity):**
- [ ] 100,000 free users
- [ ] 5,000 premium users
- [ ] £25,000/month revenue (£300k/year)
- [ ] £120,000/year donated to Wycliffe (40%)
- [ ] Charitable licensing terms negotiated
- [ ] 10+ church partnerships
- [ ] 3+ grants awarded

---

## Open Questions

1. **Bible Versions:** ✅ RESOLVED
   - Free tier: WEB, ASV, KJV (public domain, local)
   - Premium tier: NIV, ESV, NASB, NLT (API with fallback)
   - Charity model enables better publisher terms long-term

2. **Pricing Model:** ✅ RESOLVED
   - £5/month or £50/year (premium tier)
   - Multiple donation tiers (when charity)
   - Church partnerships (when charity)

3. **API Costs:** ✅ RESOLVED
   - API.Bible or ESV API
   - 500-verse cache limit (license-compliant)
   - Fallback to WEB (solves sermon problem)

4. **Collaboration:** ✅ RESOLVED
   - User-to-user sharing as premium feature (v1.6.0+)
   - Auto-conversion for free users
   - Attribution system
   - Community library

5. **Offline Mode:** 🤔 ONGOING
   - Free tier: Full offline (public domain Bibles bundled)
   - Premium tier: Partial offline (500-verse cache)
   - PWA: Medium priority (v1.8.0+)

6. **Native Apps:** 🤔 ONGOING
   - PWA works on iOS/Android
   - Wait for user demand
   - Priority: Low (PWA sufficient for now)

7. **Charity Trustees:** 🤔 NEW
   - Who to recruit? (church leader, dyslexia expert, finance)
   - When to start recruiting? (Q1 2025)
   - How to compensate? (unpaid, but can employ founder with approval)

8. **Wycliffe Partnership Model:** 🤔 NEW
   - Which option? (Sponsor specific project recommended)
   - When to contact? (Q1 2025, before charity registration)
   - What percentage? (40% of revenue suggested)

---

## Next Actions

**For v1.2.0 completion (Beautiful Reading Experience):**
1. Download USFM files for WEB, ASV, KJV from ebible.org
2. Write USFM → Enhanced JSON converter script (Node.js)
3. Convert all three Bibles with paragraphs and headings
4. Update rendering engine to display paragraphs and headings
5. Add reading mode toggle (verse-by-verse vs reading mode)
6. Implement smooth animations and transitions
7. Add optional background focus music player
8. Test on mobile devices
9. Update roadmap page with new features

**For v1.6.0 planning (Premium Tier):**
1. Sign up for API.Bible and ESV API
2. Review terms and conditions (500-verse limit)
3. Test API integration
4. Design fallback UI ("Switch to WEB")
5. Plan Stripe integration

**For v2.0.0 preparation (Charity):**
1. Document finances meticulously
2. Track user growth and impact
3. Start thinking about trustee candidates
4. Research Wycliffe partnership options
5. Plan charity constitution

**Estimated:** v1.2.0 in 3-4 weeks, then proceed with roadmap

---

**Made with ❤️ for the body of Christ**

*Long-term vision: UK registered charity funding Bible translation through Wycliffe Bible Translators*
