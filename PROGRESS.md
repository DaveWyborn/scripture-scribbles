# Scripture Scribbles - Progress Summary

**Last Updated:** 21 November 2024

---

## Current Status: v1.1.0 LIVE ✅

**URL:** https://scripturescribbles.co.uk

**Completed Features:**
- ✅ Supabase authentication (email + Google OAuth)
- ✅ Cloud sync for annotations
- ✅ WEB Bible embedded (all 66 books)
- ✅ Visual navigation (modal with book/chapter grids)
- ✅ 6-colour highlighting + underlines
- ✅ Verse notes and tags with custom colours
- ✅ Multiple annotation sets (Study, Church, Personal)
- ✅ 24 themes (light + dark)
- ✅ Export annotations (Markdown + JSON)
- ✅ Works on all devices (mobile + desktop)
- ✅ "Why We Exist" page
- ✅ Interactive roadmap with voting

**Recent Fixes:**
- ✅ Welcome screen no longer flashes for logged-in users
- ✅ Pricing messaging updated ("Free Core Features" not "Forever Free")
- ✅ Dyslexia features listed as "Coming Soon" (not yet implemented)
- ✅ Footer navigation links added

---

## Strategic Pivot: Simplicity as Differentiator

### Key Insight from YouVersion Analysis

**YouVersion's weakness = Our opportunity:**
- 16+ menu items (overwhelming)
- Font settings hidden in separate "Fonts and Settings" menu
- Giant play button always visible or hidden
- Feature bloat makes simple tasks hard

**Our approach:**
- Clean, minimal UI
- Features OFF by default (opt-in expansion)
- Easy to find settings (not buried)
- Beautiful reading over feature count
- **"Anti-YouVersion simplicity"**

### Strategic Milestone: Prove Concept Before Scaling

**Goal:** Reach 1,000 users with v1.2.0-v1.3.0
**Decision point:**
- If 1,000 users → Continue to paid tiers (v1.6.0+)
- If not → Re-evaluate strategy

**Focus areas before paid features:**
1. Beautiful, minimal reading experience
2. Fluid reading mode (paragraphs, not just verses)
3. Full dyslexia controls (fonts, spacing, colours)
4. **Reading bar** (innovative focus aid - killer feature)

---

## Innovation: Reading Bar (Killer Feature)

**What it is:**
- Digital equivalent of physical ruler used by dyslexic readers
- Helps focus on specific lines while blurring/fading surrounding text
- **No other digital Bible app has this**

**Features:**
- 4 height options: 3 lines, 5 lines, 7 lines, 1 paragraph
- 4 visual styles: Blur, Fade, Tint, Ruler
- 3 positioning modes: Fixed centre, Follows scroll, User-anchored
- Colour picker for tint/ruler
- Opacity control
- Easy toggle on/off (not forced)

**Why it matters:**
- Many dyslexic readers use physical rulers with books
- Directly addresses real reading difficulty
- Combined with spacing controls = genuine innovation
- Differentiates from all competitors (YouVersion, e-Sword, etc.)

---

## Recent Strategic Research

### Bible Versions Strategy ✅ COMPLETE

**Extensive research completed:**
- USFM format analysis (paragraphs + headings)
- YouVersion business model ($15M/year, 500M users)
- e-Sword licensing approach (one-time purchase)
- API license restrictions (500-verse cache limits)
- Sermon use case problem + solution
- Beautiful reading experience research

**Key findings:**
1. **Format:** Convert USFM → Enhanced JSON (parse once, use forever)
2. **Free tier:** Bundle public domain Bibles locally (WEB, ASV, KJV)
3. **Premium tier:** API-based licensed Bibles (NIV, ESV, NASB)
4. **Cache limit:** 500 verses maximum (API license terms)
5. **Critical solution:** Fallback to WEB for uncached passages (solves sermon problem)

**Research documents created:**
- `bible-versions-strategy-summary.md` (master document)
- `bible-paragraph-research.md`
- `bible-format-strategy.md`
- `youversion-analysis.md`
- `one-time-purchase-model.md`
- `sermon-loading-problem.md`
- `api-license-restrictions.md`
- `beautiful-reading-experience-research.md`

### Beautiful Reading Experience Research ✅ COMPLETE

**Best-in-class apps analyzed:**
- Matter ("one of the best app designs on the market")
- Instapaper (minimalist, text-first)
- Readwise Reader (powerful, fast)
- Medium (content-first, typography-focused)

**Evidence-based findings:**
- Increased spacing: +26% faster reading for dyslexic readers
- Warm backgrounds (cream, beige) reduce visual stress
- Background music: Small negative effect (especially with lyrics)
- User preferences divided on scrolling vs page turning
- Simple typography > complex features

**Design formula:**
```
Beautiful reading = simple typography + warm colours +
                   generous spacing + gentle animations +
                   minimal UI + user choice
```

### Charity Model Strategy ✅ COMPLETE

**Long-term plan (v2.0.0 at 10k users):**
- Register as UK charity (CIO)
- Partner with Wycliffe Bible Translators (40% of revenue)
- Better publisher licensing terms as charity
- Multiple revenue streams (donations, grants, church partnerships)

**Benefits:**
- Mission-driven narrative (Bible accessibility + translation funding)
- Easier to negotiate with publishers
- Easier to ask for help/favours
- Grant funding available
- Gift Aid (UK taxpayers +25% to donations)

**Research document:**
- `charity-model-strategy.md`

---

## Updated Roadmap

### v1.2.0 - Beautiful Minimal Reading + Fluid Mode (3-4 weeks)

**UI Simplification:**
- Remove all unnecessary screen clutter
- Hide UI chrome by default (auto-hide after 3s)
- Tap verse for actions (keep key actions close)
- Configurable tap behaviour:
  - Tap vs long-press (reduce accidental triggers)
  - Action menu: immediate / 1s delay / require second tap
- Clean, minimal settings menu (not 16+ items like YouVersion)

**Fluid Reading Mode:**
- USFM → Enhanced JSON converter script
- Convert WEB, ASV, KJV from USFM format
- Render paragraphs (natural flow, not verse blocks)
- Section headings (styled, toggleable)
- Verse numbers: margin or superscript (user choice)
- Toggle: Verse-by-verse vs Reading mode

**Multiple Bible Versions:**
- Add American Standard Version (ASV 1901)
- Add King James Version (KJV)
- Bible version selector (easy to find)
- All versions support fluid reading

**Gentle Animations:**
- Smooth page/chapter transitions
- Gentle fade-ins for text (300ms)
- Subtle scroll behaviour
- No aggressive animations

### v1.3.0 - Full Dyslexia Controls + Reading Bar (2-3 weeks)

**Typography & Spacing (Full User Control):**
- Font selection:
  - OpenDyslexic (primary)
  - Atkinson Hyperlegible
  - System serif
  - System sans-serif
- Spacing controls (research-backed):
  - Font size slider (12px - 32px+)
  - Line spacing adjustment (1.0x - 2.5x)
  - Letter spacing adjustment (0x - 0.2em)
  - Word spacing adjustment (optional)
  - Bold toggle

**Colour Controls:**
- Full colour customisation:
  - Background colour picker
  - Text colour picker
  - Annotation colour picker
- Dyslexia-optimised themes:
  - Yellow on black
  - Cream on dark blue
  - High contrast options
- Warm backgrounds for reduced visual stress

**Reading Bar (NEW - Killer Feature):**
- Adjustable focus bar (mimics physical ruler)
- Bar height options: 3/5/7 lines, paragraph
- Visual styles: Blur, Fade, Tint, Ruler
- Positioning: Centre, Follows scroll, Anchored
- Colour picker + opacity control
- Easy toggle on/off

### v1.4.0 - Sermon Notes (3-4 weeks)
- Side-by-side view (desktop: Bible + Notes)
- Swipe left/right (mobile: switch Bible ↔ Notes)
- Large clean text editor
- Quick verse insertion
- Export to Markdown

### v1.5.0 - Word-Level Highlighting (2 weeks)
- Select individual words
- Smart merge with verse highlights
- Clear behaviour rules

### v1.6.0 - Multiple Bible Versions & Paid Tier (4-5 weeks)
**Only proceed if 1,000 users achieved**

**Free Tier:**
- WEB, ASV, KJV (bundled locally)
- Always instant, works offline

**Premium Tier (£5/month):**
- NIV, ESV, NASB, NLT via API
- Smart 500-verse rolling cache
- Pre-fetch next chapters
- **Fallback to WEB** (critical for sermon use case)
- Stripe integration

### v1.7.0 - Audio Reader (Premium) (3-4 weeks)
- High-quality AI voice
- Sentence-level highlight/underline (better than YouVersion)
- Usage-based fair pricing
- Background playback

### v1.8.0 - Devotionals & Explainers (3-4 weeks)
**Key principle: Opt-in, not forced bloat**

**Devotionals:**
- Curated, high-quality sources (3-5 series)
- Same beautiful reading tools
- Separate section (not mixed with Bible)
- OFF by default

**Book/Chapter Explainers:**
- Book introductions (author, context, themes)
- Brief chapter summaries (2-3 sentences)
- Collapsed by default
- Public domain sources (Matthew Henry simplified)
- OFF by default

**UX approach:**
- When OFF: Doesn't exist in UI (truly minimal)
- When ON: Appears cleanly without cluttering

### v2.0.0 - Charity Transition (3-6 months)
**When 10,000+ users achieved**

- Register as UK charity (CIO)
- Recruit 2-3 trustees
- Partner with Wycliffe Bible Translators (40% revenue)
- Contact publishers for charitable licensing terms
- New revenue streams (donations, grants, church partnerships)

### v2.5.0+ - Beyond Bible Content (Future)
**Only pursue if dyslexia community responds strongly**

**Potential expansions:**
- Christian books, theology, commentaries
- General reading (articles, ePubs, PDFs)
- Educational content (textbooks, papers)

**All with same powerful tools:**
- Reading bar
- Spacing controls
- Font customisation
- Audio reading
- Annotations

**Decision criteria:**
- ✅ 10,000+ Bible users
- ✅ Strong dyslexia community engagement
- ✅ User requests for non-Bible content
- ✅ Sustainable business model

**Positioning evolution:**
- From: "Dyslexia-friendly Bible app"
- To: "Dyslexia-friendly reading app (started with Bible)"
- Bible remains primary mission
- Tools become outreach to broader dyslexia community

---

## Key Design Principles

**Simplicity over features:**
- Keep it simple
- Remove all unnecessary screen clutter
- Clean text with full user choice
- Remove all buttons, keep actions close (tap verse)
- Allow tap behaviour customisation

**Anti-YouVersion:**
- YouVersion: 16+ menu items, buried settings, bloated
- Scripture Scribbles: Minimal, easy to find, clean
- Not trying to do everything
- Doing reading experience exceptionally well

**Dyslexia-first:**
- Every design decision considers text processing difficulty
- Reading bar innovation (physical ruler equivalent)
- Research-backed spacing controls (+26% faster reading)
- Full user control (what works varies per person)

**Opt-in expansion:**
- Core features visible
- Optional features OFF by default
- Easy to enable if wanted
- Easy to completely remove from UI

**Beautiful reading:**
- Simple typography
- Warm colours
- Generous spacing
- Gentle animations
- Minimal UI
- User choice

---

## Success Metrics

**v1.2.0-v1.3.0 Launch:**
- Target: 1,000 users
- 80%+ try reading mode
- 50%+ prefer reading mode over verse-by-verse
- <5% support requests about reading mode

**Decision point:**
- If 1,000 users → Continue to v1.6.0 (paid tier)
- If not → Re-evaluate strategy

**v1.6.0 (Paid Tier):**
- 5% conversion to premium
- 1,000 free users → 50 premium
- £250/month revenue
- <2% churn rate

**6-Month Goals:**
- 10,000 free users
- 500 premium users
- £2,500/month revenue

**12-Month Goals:**
- 50,000 free users
- 2,500 premium users
- £12,500/month revenue

**v2.0.0 (Charity):**
- 100,000 free users
- 5,000 premium users
- £25,000/month revenue
- £120,000/year to Wycliffe (40%)

---

## Technical Priorities

**Immediate (v1.2.0) - Next 3-4 weeks:**
1. Download WEB, ASV, KJV in USFM format (ebible.org)
2. Write USFM → Enhanced JSON converter (Node.js)
3. Implement paragraph/heading rendering engine
4. Add reading mode toggle
5. Simplify UI (remove clutter, configurable tap)
6. Polish animations and transitions

**Short-term (v1.3.0) - Following 2-3 weeks:**
1. Implement font selection
2. Build spacing controls (line, letter, word)
3. Full colour customisation system
4. **Build reading bar** (blur, fade, tint, ruler modes)
5. Create dyslexia-optimised themes

**Medium-term (v1.4.0-v1.5.0) - IF 1,000 users achieved:**
1. Sermon notes editor
2. Word-level highlighting engine

**Long-term (v1.6.0+) - IF continued validation:**
1. API integration for licensed Bibles
2. Smart caching + fallback system
3. Stripe subscription/billing
4. Audio API integration
5. Usage tracking and limits

---

## Open Questions (Future Decisions)

**Not for today - document for reference:**

1. **API Provider (v1.6.0):**
   - API.Bible (2,500+ versions) vs ESV API (just ESV)?
   - Recommendation: API.Bible (more versions, one API)

2. **Focus Music (v1.2.0 optional):**
   - Include or defer?
   - If include: 3-5 instrumental tracks (~2-5 MB each)
   - Research says small negative effect, but user preference varies

3. **Wycliffe Partnership Model (v2.0.0):**
   - Direct donation (40% of revenue)?
   - Designated fund?
   - Sponsor specific translation project? (recommended)

4. **Trustee Recruitment (v2.0.0):**
   - Church leader/theological advisor
   - Accessibility/dyslexia expert
   - Finance/business person
   - When to start recruiting? (Q1 2025)

5. **Beyond Bible Content (v2.5.0+):**
   - Balance: Not in-your-face Bible, but not hiding it either
   - How to serve dyslexic readers who want tools but not Bible?
   - Nice problem to have if we get there

---

## What's Next

**Immediate focus:** Start v1.2.0 implementation when ready

**Pre-implementation checklist:**
1. Download USFM files from ebible.org
2. Study USFM format structure
3. Plan JSON schema for enhanced format
4. Design reading mode rendering approach
5. Plan UI simplification changes

**Timeline to validation:** ~6 weeks (v1.2.0 + v1.3.0)

**After 1,000 users:**
- Measure engagement with key features
- Gather user feedback on reading bar
- Decide whether to continue to paid features
- Share results and plan next phase

---

## Notes for Next Session

**Context established:**
- Anti-YouVersion simplicity is the strategy
- Reading bar is killer feature (genuinely innovative)
- Prove concept with 1,000 users before paid features
- All research completed and documented
- Roadmap updated with clear priorities
- Ready to begin v1.2.0 implementation when Dave returns

**No immediate tasks pending** - waiting for Dave to:
1. Review progress and research
2. Share with community for feedback
3. Return to begin v1.2.0 development

---

**Made with ❤️ for the body of Christ**

*Long-term vision: UK charity making Bible accessible for dyslexic readers while funding Bible translation through Wycliffe Bible Translators*
