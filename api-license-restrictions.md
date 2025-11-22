# API License Restrictions for Caching/Download

## Critical Finding: **NO, You Cannot Download Entire Bible**

### ESV API Restrictions

**Caching Limit: 500 Verses Maximum**
> "You may not locally store more than 500 verses or one-half of any book of the Bible (whichever is less)."

**API Rate Limits:**
- 5,000 queries per day
- 1,000 requests per hour
- 60 requests per minute
- Maximum 500 verses per query

**Terms:**
- Free for non-commercial use
- Must clear cache periodically
- Cannot locally store entire Bible
- Must request verses on-demand

**Why this restriction exists:**
- Copyright protection
- Prevents unauthorized redistribution
- Ensures users stay connected to API (updates, bug fixes)
- Publisher control over content

---

### API.Bible Restrictions

**Caching Limit: 500 Verses Maximum**
> "Display 500 consecutive verses at a time"

**Cache Duration:**
> "Clear your cache every 14 days or less"

**Rate Limits:**
- 5,000 queries per day (default)

**Commercial Use:**
- Non-commercial use only by default
- Must contact support@api.bible for commercial approval

**Terms:**
- Personal, non-exclusive, non-transferable license
- Revocable at their discretion
- Cannot use for commercial purposes without approval

---

## What This Means for Scripture Scribbles

### ❌ **Cannot Do:**
- Download entire NIV/ESV Bible for offline use
- Cache more than 500 verses per translation
- Store permanently for offline access
- Build "download once, use forever" feature (like e-Sword)

### ✅ **Can Do:**
- Cache up to 500 verses (temporary)
- Cache recent/common verses (rolling cache)
- Pre-fetch next chapter while reading
- Use on-demand API calls
- Clear cache every 14 days

---

## Implication for Your Premium Model

### The Full Download Approach: **NOT ALLOWED** ❌

**Original plan:**
- Download entire NIV/ESV on subscription
- Store all 66 books locally
- Always instant, works offline

**Reality:**
- 500 verse limit = ~20 chapters
- Entire Bible = ~31,000 verses
- **Violates license terms**

---

### The Subscription Model: **ALLOWED** ✅

**Revised plan:**
- On-demand API calls for premium Bibles
- Cache up to 500 verses (rolling window)
- Pre-fetch next chapter
- Clear cache every 14 days
- **Fallback to WEB for offline/slow connections**

---

## Revised Premium Strategy

### Option 1: Smart 500-Verse Cache (Compliant)

**Implementation:**
```javascript
const MAX_CACHED_VERSES = 500;
let cachedVerses = [];

async function cacheChapter(book, chapter, version, verses) {
  // Add to cache
  cachedVerses.push({ book, chapter, version, verses, timestamp: Date.now() });

  // Count total verses
  const totalVerses = cachedVerses.reduce((sum, item) => sum + item.verses.length, 0);

  // If over 500, remove oldest
  while (totalVerses > MAX_CACHED_VERSES) {
    cachedVerses.shift(); // Remove oldest
  }

  // Clear cache older than 14 days
  const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
  cachedVerses = cachedVerses.filter(item => item.timestamp > fourteenDaysAgo);

  await saveCacheToDB(cachedVerses);
}
```

**What gets cached:**
- Most recently read 500 verses
- Includes pre-fetched next chapters
- Covers ~20 chapters (average 25 verses/chapter)
- Rolling window (oldest drop when new added)

**User experience:**
- Recent chapters = instant
- Common books (Matthew, John, Romans) = often cached
- Obscure books (Obadiah) = not cached, requires API call

---

### Option 2: Strategic Book Caching (Compliant)

**Implementation:**
- Cache most commonly preached books
- Stay under 500 verse limit

**Priority books to cache (total ~400 verses):**
1. John 1-3 (~150 verses)
2. Romans 1-2 (~66 verses)
3. Matthew 5-7 (Sermon on Mount, ~111 verses)
4. Ephesians 1-2 (~54 verses)
5. Psalms 23, 1, 100 (~30 verses)

**Why this works:**
- Covers most common sermon passages
- Under 500 verse limit
- User never knows it's cached (just works)
- Less common passages = API call

---

### Option 3: Intelligent Predictive Caching (Compliant)

**Implementation:**
- Track user's reading patterns
- Pre-fetch likely next chapters
- Keep 500 most useful verses cached

**Algorithm:**
```javascript
async function intelligentCache() {
  // User reading history
  const recentBooks = getUserRecentBooks(); // e.g., Matthew, Romans

  // Pre-fetch next chapters in those books
  const predictedChapters = predictNextChapters(recentBooks);

  // Cache predicted chapters (up to 500 verses)
  for (const chapter of predictedChapters) {
    if (getTotalCachedVerses() < 500) {
      await fetchAndCache(chapter);
    }
  }
}
```

**Example:**
- User reading Matthew 5
- Pre-fetch: Matthew 6, 7, 8 (most likely next)
- When user clicks Matthew 6 → instant (already cached)
- Background: Fetch Matthew 9 (rolling cache)

---

## Solving the Sermon Problem (Within License Terms)

### Problem Recap:
- Preacher: "Turn to Obadiah 1"
- User on slow WiFi
- Obadiah not in 500-verse cache
- API call takes 3-5 seconds

### Solution: Fallback to WEB (Your Original Idea) ✅

**Implementation:**
```javascript
async function loadChapter(book, chapter, version) {
  // Free tier: Always instant (local WEB)
  if (version === 'WEB') {
    return loadLocalWEB(book, chapter);
  }

  // Premium tier: Check cache first
  const cached = await checkCache(book, chapter, version);
  if (cached) {
    return cached; // Instant if cached
  }

  // Not cached - show loading with fallback
  showLoadingModal({
    message: `Loading ${book} ${chapter} (${version})...`,
    timeout: 2000, // Show fallback after 2s
    fallbackButton: {
      text: "Switch to WEB (instant)",
      action: () => loadLocalWEB(book, chapter)
    }
  });

  try {
    const data = await fetchWithTimeout(book, chapter, version, 5000);
    hideLoadingModal();

    // Cache for next time (within 500 verse limit)
    await addToCache(book, chapter, version, data);

    return data;
  } catch (error) {
    // Timeout or error - user already switched to WEB or waited
    throw error;
  }
}
```

**User Experience:**

**Scenario 1: Cached (common):**
- User taps "Matthew 5 (NIV)"
- **Instant load** (in 500-verse cache)

**Scenario 2: Not cached, good connection:**
- User taps "Obadiah 1 (NIV)"
- Loading... 0.5 seconds
- **Loads quickly**

**Scenario 3: Not cached, slow connection (worst case):**
- User taps "Obadiah 1 (NIV)"
- Loading... 1s... 2s...
- **"Switch to WEB (instant)" button appears**
- User clicks → WEB loads instantly
- Background: NIV Obadiah downloads and caches
- Next time: NIV instant (cached)

---

## Revised Business Model

### Free Tier
- **WEB, ASV, KJV** (public domain)
- Bundled locally (~21 MB)
- **Always instant**
- Works offline
- No restrictions

### Premium Tier: £5/month
- **NIV, ESV, NASB** (via API)
- Smart 500-verse rolling cache
- Pre-fetching next chapters
- **Instant when cached** (most of the time)
- **Fallback to WEB** when not cached
- Requires internet for uncached passages

---

## User Messaging

### Settings Panel

```
Premium Bibles

NIV (New International Version)
• 500 verse smart cache (most recent)
• Pre-fetches next chapters
• Fallback to WEB for instant access

[Clear cache]

Last cache refresh: 3 days ago
Cache contains: 487/500 verses
Most cached: Matthew, Romans, John
```

### First Premium Subscription

```
🎉 Welcome to Premium!

You now have access to NIV, ESV, and NASB.

How it works:
• Your 500 most recent verses are cached
• Next chapters pre-fetch automatically
• If a verse isn't cached, we load it instantly
• Slow connection? Switch to WEB (instant)

[Got it]
```

### Loading with Fallback

```
┌─────────────────────────────────┐
│  Loading Obadiah 1 (NIV)...     │
│  [━━━━━━━━        ] 2s          │
│                                  │
│  On slow connection?             │
│                                  │
│  [Switch to WEB (instant)]       │
└─────────────────────────────────┘
```

---

## Competitive Analysis

### What YouVersion Does

**YouVersion can download entire Bibles because:**
- They have **direct licensing agreements** with publishers
- Not using API (bundle Bibles directly)
- Pay flat annual fees (~$1,000/year per translation)
- 500M users = massive leverage
- Non-profit status

**You cannot do this because:**
- Using API (not direct licensing)
- API terms prohibit full download
- No leverage (yet)

---

### What e-Sword Does

**e-Sword can bundle Bibles because:**
- Direct licensing with publishers
- User pays per Bible (NIV = $20)
- Publishers get per-copy royalty
- Desktop software (easier DRM)
- Established 25 years (trusted by publishers)

**You cannot do this because:**
- No direct licensing (yet)
- Using API instead
- API terms prohibit bundling

---

## Path Forward

### v1.6.0: API + Smart Caching (Now)

**Implement:**
- ✅ Premium subscription (£5/month)
- ✅ NIV, ESV, NASB via API
- ✅ 500-verse smart cache (compliant)
- ✅ Pre-fetch next chapters
- ✅ **Fallback to WEB** (instant escape hatch)

**User experience:**
- Free: WEB always instant (local)
- Premium: Cached = instant, uncached = 0.5-2s or fallback to WEB

---

### v2.0.0: Direct Licensing (Later, if scale justifies)

**When you have 10,000+ users:**
- Approach Crossway and Biblica directly
- Negotiate per-copy or annual licensing
- Bundle Bibles locally (like e-Sword)
- Offer one-time purchase option

**Then you can:**
- ✅ Download entire Bible
- ✅ Always instant (no API calls)
- ✅ Works completely offline
- ✅ No 500-verse limit

---

## Bottom Line

**Your question:**
> Do the licenses allow downloading the entire Bible in one go?

**Answer: NO** ❌

**ESV API:** 500 verses maximum
**API.Bible:** 500 verses maximum, 14-day cache
**Both:** Cannot bundle entire Bible locally

**What you CAN do:**
1. ✅ Smart 500-verse rolling cache (compliant)
2. ✅ Pre-fetch next chapters
3. ✅ Fallback to local WEB (instant safety net)
4. ✅ Most chapters cached most of the time
5. ✅ Clear value: Premium = modern translations on-demand

**What you CANNOT do:**
1. ❌ Download entire NIV/ESV for offline
2. ❌ "Buy once, own forever" model (like e-Sword)
3. ❌ Cache more than 500 verses permanently

**Sermon scenario solution:**
- 500-verse cache covers ~20 recent chapters
- Common books (Matthew, Romans) stay cached
- Uncommon books (Obadiah) = API call with WEB fallback
- User never stuck waiting (fallback button after 2s)

**This is why the hybrid approach is essential** - free tier (local WEB) + premium tier (API with fallback) gives best of both worlds within license restrictions.
