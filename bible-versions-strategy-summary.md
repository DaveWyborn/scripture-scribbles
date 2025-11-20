# Bible Versions Strategy - Complete Summary

**Date:** 20 November 2024
**Status:** Research complete, ready for decision

---

## The Question

How should Scripture Scribbles handle multiple Bible versions (NIV, ESV, etc.) for v1.6.0?

---

## Key Research Findings

### 1. Format Strategy

**Question:** Should we use USFM in the app or convert to JSON?

**Answer: Convert from USFM to enhanced JSON** ✅

**Why:**
- USFM = industry standard source format (like source code)
- JSON = optimized runtime format (like compiled code)
- Parse USFM once, use JSON forever
- No runtime parsing = instant loading

**Public domain Bibles with paragraphs/headings:**
- WEB, ASV, KJV available in USFM from ebible.org
- USFM includes paragraph markers (`\p`) and section headings (`\s1`, `\s2`)
- Convert once to enhanced JSON with paragraphs + headings
- Enables natural reading mode (not just verse-by-verse)

---

### 2. YouVersion Analysis

**How they work:**
- Non-profit 501(c)(3) ministry of Life.Church
- $15M/year in donations (500M users)
- Direct licensing with publishers (~$50k/year total for 50+ Bibles)
- Bundle entire Bibles locally (200 MB per Bible)
- Always instant, works offline
- Free for all users (donation-supported)

**Why publishers say yes:**
- Massive exposure (500M users)
- Drives physical Bible sales
- Mission alignment
- Non-profit gets preferential terms

**Why we can't copy this (yet):**
- No leverage (small user base initially)
- For-profit = higher licensing fees
- Can't negotiate YouVersion-style deals upfront

---

### 3. e-Sword Model (One-Time Purchase)

**How they work:**
- Free software + public domain Bibles
- Licensed Bibles = one-time purchase (NIV $20, NASB $20)
- User downloads, owns forever, works offline
- Direct licensing with publishers (per-copy royalty ~$5-10)

**Requirements to do this:**
- Apply to publishers (Crossway, Biblica)
- 8-12 month approval process
- Must prove app is "unique and innovative"
- 49-field application form (NIV)
- Per-copy royalty or annual license fee

**Why not start with this:**
- 8-12 month delay (app sits idle waiting)
- Risk of rejection
- Need leverage (user base demanding NIV/ESV)
- No recurring revenue model

---

### 4. API License Restrictions (CRITICAL)

**ESV API:**
- ❌ Maximum cache: 500 verses
- ❌ Cannot store more than "500 verses or half a book (whichever is less)"
- ❌ Must clear cache periodically
- ✅ Free for non-commercial use

**API.Bible:**
- ❌ Maximum cache: 500 verses
- ❌ Cache duration: 14 days maximum
- ❌ Commercial use requires approval
- ✅ Access to 2,500+ translations

**What this means:**
- ❌ Cannot download entire Bible (31,000+ verses)
- ❌ Cannot offer "download once, use forever" via API
- ✅ Can cache 500 most recent verses (rolling window)
- ✅ Can pre-fetch next chapters
- ✅ Must use on-demand API calls for uncached passages

**500 verses = ~20 chapters** (enough for recent reading, not enough for entire Bible)

---

## The Sermon Problem (Critical Use Case)

**Scenario:**
- User sitting in church
- Preacher: "Turn to Obadiah chapter 1"
- User has never opened Obadiah (not in 500-verse cache)
- Church WiFi is slow/congested
- API call takes 2-5 seconds (or fails)

**Result:**
- User misses what preacher said
- Feels embarrassed
- Thinks "This app is useless in church"
- **Uses YouVersion instead**

**This is mission-critical** - sermon following is a primary Bible app use case.

---

## Recommended Solution: Hybrid Model

### Free Tier (Public Domain - Local JSON)

**Bibles:**
- World English Bible (WEB)
- American Standard Version (ASV)
- King James Version (KJV)

**Storage:**
- Bundle locally as JSON (~21 MB total)
- Enhanced JSON with paragraphs + headings
- Convert from USFM (one-time)

**User Experience:**
- ✅ Always instant (no API calls)
- ✅ Works offline
- ✅ No restrictions
- ✅ Reading mode + verse-by-verse mode
- ✅ Solves sermon problem for free users

---

### Premium Tier (Licensed - API with Smart Caching)

**Bibles:**
- New International Version (NIV)
- English Standard Version (ESV)
- New American Standard Bible (NASB)
- New Living Translation (NLT)

**Pricing:**
- £5/month or £50/year

**Technical Implementation:**
- API.Bible or ESV API
- Smart 500-verse rolling cache (license-compliant)
- Pre-fetch next chapters while reading
- Cache clears every 14 days (automatic)

**User Experience:**
- ✅ Instant when cached (~20 recent chapters)
- ✅ 0.5-2 seconds when not cached (good connection)
- ⚠️ 2-5 seconds when not cached (slow connection)
- ✅ **Fallback to WEB** (critical safety net)

---

## The Fallback Solution (Essential)

**When loading uncached premium Bible:**

```
┌─────────────────────────────────┐
│  Loading Obadiah 1 (NIV)...     │
│  [━━━━━━━━        ] 2s          │
│                                  │
│  Connection slow?                │
│                                  │
│  [Switch to WEB (instant) →]     │
└─────────────────────────────────┘
```

**Why this works:**
- User never stuck waiting
- WEB is solid public domain translation
- Always available (local JSON)
- Graceful degradation
- After switching, NIV caches for next time

**Sermon scenario solved:**
1. Preacher: "Turn to Obadiah"
2. User taps Obadiah 1 (NIV)
3. Loading... 2 seconds...
4. User taps "Switch to WEB" → Instant
5. User can follow along immediately
6. Background: NIV Obadiah caches for next time

---

## Financial Projections

### Subscription Model (Premium Tier)

**Assumptions:**
- £5/month per user
- API costs: ~£2/month per user (generous estimate)
- Margin: £3/month per user

**Revenue Scenarios:**

| Premium Users | Monthly Revenue | API Costs | Monthly Profit | Annual Profit |
|---------------|-----------------|-----------|----------------|---------------|
| 100 | £500 | £200 | £300 | £3,600 |
| 500 | £2,500 | £1,000 | £1,500 | £18,000 |
| 1,000 | £5,000 | £2,000 | £3,000 | £36,000 |
| 5,000 | £25,000 | £10,000 | £15,000 | £180,000 |

**Break-even:** Immediate (no upfront costs)

---

## Implementation Phases

### Phase 1: v1.6.0 - Multiple Public Domain Bibles (Now)

**Timeline:** 2-3 weeks

**Tasks:**
1. Download WEB, ASV, KJV in USFM format
2. Write USFM → Enhanced JSON converter (Node.js)
3. Convert all three Bibles (with paragraphs + headings)
4. Update app to render paragraphs and section headings
5. Add Bible version selector in settings
6. Test reading mode vs study mode

**Deliverables:**
- 3 public domain Bibles with natural reading mode
- ~21 MB bundle (local, instant, offline)
- Foundation for premium tier

---

### Phase 2: v1.6.0 - Premium Tier with Licensed Bibles

**Timeline:** 3-4 weeks

**Tasks:**
1. Sign up for API.Bible and/or ESV API
2. Implement API integration
3. Build 500-verse rolling cache (license-compliant)
4. Implement pre-fetch next chapter logic
5. Build fallback to WEB modal
6. Add Stripe payment integration
7. Create premium subscription flow
8. Test on slow connections

**Deliverables:**
- Premium tier (£5/month)
- NIV, ESV, NASB, NLT access
- Smart caching + fallback
- Payment system

---

### Phase 3: v2.0.0+ - Direct Licensing (Future, Optional)

**When:** After 10,000+ paid subscribers

**Approach:**
1. Contact Crossway (ESV) and Biblica (NIV) directly
2. Show traction: "10,000 users paying £5/month want your Bible"
3. Negotiate annual licensing (~£5,000/year per Bible)
4. Bundle Bibles locally (like e-Sword)
5. Offer one-time purchase option (£40 lifetime)

**Benefits:**
- Always instant (no API calls)
- Works completely offline
- No 500-verse cache limit
- Better user experience

**Only worth it at scale** (API costs + recurring revenue better when small)

---

## User Messaging Examples

### Free Tier

```
Scripture Scribbles Free

✓ 3 Public Domain Bibles (WEB, ASV, KJV)
✓ Always instant (works offline)
✓ Rich annotations and notes
✓ Multiple annotation sets
✓ Export to Markdown
✓ 24 beautiful themes

[Get Started Free]
```

---

### Premium Tier

```
Upgrade to Premium

£5/month or £50/year

✓ Everything in Free, plus:
✓ Modern translations (NIV, ESV, NASB, NLT)
✓ Smart caching (instant for recent chapters)
✓ Pre-fetching (next chapters ready)
✓ Always have WEB as instant fallback

[Start 7-Day Free Trial]
```

---

### First Premium Load (Not Cached)

```
┌─────────────────────────────────┐
│  Loading Matthew 5 (NIV)...     │
│  [━━━━━━━━━━━━━━━━━━] Done!    │
│                                  │
│  ✓ Matthew 5 is now cached       │
│  Next time: Instant load         │
└─────────────────────────────────┘
```

---

### Sermon Scenario (Slow Connection)

```
┌─────────────────────────────────┐
│  Loading Obadiah 1 (NIV)...     │
│  [━━━━━━━━        ] 3s          │
│                                  │
│  Connection is slow              │
│                                  │
│  [Switch to WEB (instant)]       │
│  [Keep waiting for NIV]          │
└─────────────────────────────────┘
```

---

### After Fallback

```
✓ Loaded Obadiah 1 (WEB)

NIV Obadiah is downloading in the background.
Next time you'll see NIV instantly.

Your annotations work across all Bible versions.
```

---

### Settings - Bible Version Selector

```
Current Bible: NIV (Premium)

FREE BIBLES (Always Instant)
○ World English Bible (WEB)
○ American Standard Version (ASV)
○ King James Version (KJV)

PREMIUM BIBLES (Requires Internet)
● New International Version (NIV)
○ English Standard Version (ESV)
○ New American Standard Bible (NASB)
○ New Living Translation (NLT)

Cache: 487/500 verses
Most cached: Matthew, Romans, John

[Clear cache] [Upgrade to Premium]
```

---

## Competitive Positioning

### vs YouVersion

**YouVersion strengths:**
- Free (donation-supported)
- Massive version library (2,500+)
- Always instant (local downloads)
- 500M users (network effect)

**Scripture Scribbles differentiators:**
- ✅ Dyslexia-focused features (coming v1.2.0)
- ✅ Sermon notes side-by-side (coming v1.3.0)
- ✅ Multiple annotation sets
- ✅ Reading mode with paragraphs
- ✅ Export to Markdown
- ✅ Fair pricing (free tier genuinely useful)

---

### vs e-Sword

**e-Sword strengths:**
- Desktop power (concordances, commentaries)
- One-time purchase (own forever)
- Established 25 years (trusted)

**Scripture Scribbles differentiators:**
- ✅ Modern web app (works everywhere)
- ✅ Mobile-first design
- ✅ Cloud sync across devices
- ✅ Clean, distraction-free reading
- ✅ Sermon notes integration
- ✅ 24 beautiful themes

---

## Open Questions for Tomorrow

### 1. Pricing Confirmation
- £5/month or £50/year?
- Or different tiers (£3, £5, £10)?
- Family plan (£8/month for 5 users)?

### 2. Free Trial Duration
- 7 days?
- 14 days?
- 30 days?

### 3. Bible Version Priority
- Which APIs: API.Bible or ESV API or both?
- Which versions first: NIV + ESV only, or add NASB + NLT immediately?

### 4. Reading Mode Timeline
- Implement paragraphs in v1.6.0 with multiple Bibles?
- Or defer to separate v1.2.0 (Dyslexia Features)?

### 5. Export Compliance
- Current 250-verse limit stays?
- Update messaging to show which version being exported?

---

## Recommended Decision

### For v1.6.0: Multiple Bible Versions & Paid Tier

**Approach:**
1. ✅ Add ASV and KJV to free tier (alongside WEB)
2. ✅ Launch premium tier: £5/month for NIV, ESV, NASB
3. ✅ Use API.Bible (2,500+ versions, one API)
4. ✅ Smart 500-verse cache + pre-fetch
5. ✅ **Fallback to WEB** (critical for sermon use case)
6. ✅ 7-day free trial
7. ✅ Stripe integration
8. ⏳ Defer paragraphs/reading mode to v1.2.0 (Dyslexia Features)

**Why this works:**
- Immediate launch (no licensing delays)
- Low risk (API costs scale with users)
- Solves sermon problem (WEB fallback)
- Recurring revenue (sustainable business)
- Clear upgrade path (v2.0.0 direct licensing if scale justifies)

**Timeline:** 4-5 weeks total
- Week 1-2: Add ASV/KJV (public domain)
- Week 3-5: Premium tier + API + payments

---

## Success Metrics

**v1.6.0 Launch Goals:**
- 5% conversion to premium (industry standard)
- 1,000 free users → 50 premium users
- £250/month revenue
- <2% churn rate

**6-Month Goals:**
- 10,000 free users
- 500 premium users (5% conversion)
- £2,500/month revenue (£30k/year)

**12-Month Goals:**
- 50,000 free users
- 2,500 premium users (5% conversion)
- £12,500/month revenue (£150k/year)

**When to consider direct licensing:**
- 10,000+ premium subscribers
- £50k+/month revenue
- Can justify £20-30k/year in licensing fees
- Negotiate better terms with publishers

---

## Files Created During Research

1. `bible-paragraph-research.md` - USFM format and paragraph markers
2. `bible-format-strategy.md` - USFM vs JSON vs API comparison
3. `youversion-analysis.md` - How YouVersion works and their business model
4. `one-time-purchase-model.md` - e-Sword model and licensing process
5. `sermon-loading-problem.md` - Sermon scenario and fallback solutions
6. `api-license-restrictions.md` - 500-verse cache limits and terms
7. `bible-versions-strategy-summary.md` - This document

---

## Next Steps

**Tomorrow:**
1. Review this summary
2. Decide on pricing (£5/month?)
3. Choose API provider (API.Bible recommended)
4. Confirm timeline (4-5 weeks for v1.6.0?)
5. Create tasks for implementation

**After decision:**
1. Update roadmap
2. Update PROGRESS.md
3. Plan v1.6.0 sprint
4. Begin USFM converter for public domain Bibles

---

**Bottom Line:**

The hybrid free/premium model with WEB fallback is the best approach:
- Free tier: Local public domain Bibles (instant, offline)
- Premium tier: API-based licensed Bibles (cached, with fallback)
- Solves sermon problem within license constraints
- Sustainable business model
- Clear upgrade path when scale justifies direct licensing

The fallback to WEB is not a compromise—it's a **feature** that ensures users are never stuck waiting.
