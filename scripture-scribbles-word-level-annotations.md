# Word-Level Annotations & Cross-Translation Syncing

## The Problem

**Example:** 1 Corinthians 13 uses "love" (agape) throughout
- NIV: "love"
- ESV: "love"
- KJV: "charity"
- Greek: ἀγάπη (agape)

User highlights "love" in NIV → how to show in KJV as "charity"?

**More complex:** John 21:15-17 - three different Greek words for "love"
- ἀγαπάω (agapao) - selfless love
- φιλέω (phileo) - brotherly love
- NIV/ESV both translate as "love" (loses the nuance)
- User wants to highlight each occurrence differently based on Greek meaning

## Current Limitation

Word highlights store position/text:
```json
{
  "verse": 15,
  "highlights": [
    {
      "text": "love",
      "color": "yellow",
      "startOffset": 45,
      "endOffset": 49
    }
  ]
}
```

This breaks when switching translations because:
1. Word position changes
2. Word itself might change ("love" → "charity")
3. Multiple words might map to one ("steadfast love" → "mercy")

## Possible Solutions

### Solution 1: Strong's Number Integration

**How it works:**
- Strong's Concordance assigns number to each Hebrew/Greek word
- G26 = ἀγάπη (agape)
- G5368 = φιλέω (phileo)
- Many Bible APIs provide Strong's numbers per word

**Implementation:**
```json
{
  "verse": 15,
  "wordAnnotations": [
    {
      "strongs": "G25",  // agapao
      "note": "Selfless, divine love",
      "color": "yellow",
      "occurrenceInVerse": 1  // which instance if word appears multiple times
    }
  ]
}
```

**Pros:**
- Language-agnostic
- Works across all translations
- Academically solid
- Can show original word meanings

**Cons:**
- Requires Bible with Strong's data
- Need API or embedded Strong's database
- More complex UX

### Solution 2: Lemma-Based Matching

**How it works:**
- Store the root word (lemma) not the specific form
- "loves", "loving", "loved" all map to lemma "love"
- Use NLP to match across translations

**Implementation:**
```json
{
  "verse": 15,
  "wordAnnotations": [
    {
      "lemma": "love",
      "originalGreek": "agapao",
      "note": "Selfless love",
      "color": "yellow"
    }
  ]
}
```

**Pros:**
- More user-friendly than Strong's
- Can work without Strong's data initially

**Cons:**
- Less precise than Strong's
- Complex NLP required
- "love" in KJV might be "charity" - harder to auto-match

### Solution 3: Hybrid - Semantic Word Groups

**How it works:**
- Let user create "word groups" manually
- Group: "Agape" contains: ["love" (NIV), "charity" (KJV), "ἀγάπη" (Greek)]
- Highlight any word in group → all instances across versions get highlighted

**Implementation:**
```json
{
  "wordGroups": [
    {
      "id": "agape-love",
      "label": "Agape (Selfless Love)",
      "words": [
        {"version": "NIV", "text": "love"},
        {"version": "KJV", "text": "charity"},
        {"version": "Greek", "text": "ἀγάπη"}
      ],
      "color": "yellow",
      "note": "Divine, selfless love"
    }
  ],
  "verses": {
    "13": {
      "wordGroupInstances": [
        {"groupId": "agape-love", "position": "all"}
      ]
    }
  }
}
```

**Pros:**
- User has full control
- No external data needed
- Can handle any nuance user wants

**Cons:**
- Manual work for user
- Doesn't scale to whole Bible easily

### Solution 4: API-Powered Alignment

**How it works:**
- Use Bible API with word alignment data
- APIs like bible.com, ESV API, or bible-api.com provide word-level data
- Some have pre-aligned translations to original languages

**Implementation:**
- Query API when user highlights word
- API returns: original language word, Strong's number, all translation equivalents
- Store reference to original word, not English position

**Pros:**
- Most accurate
- Professional quality data
- Could show interlinear text

**Cons:**
- Requires internet (breaks offline-first principle)
- API costs/limits
- Dependency on external service

## Recommended Approach

**Phase 1 (v1.1.0):** Version-Specific Word Highlights
- Keep current system
- Word highlights don't sync across versions
- Simple, works offline, no dependencies

**Phase 2 (v1.2.0):** Optional Strong's Integration
- Partner with open Bible API (bible-api.com, getbible.net)
- When user highlights word, optionally look up Strong's number
- Store Strong's number alongside word
- Show original Greek/Hebrew meaning in tooltip
- Sync highlights across versions using Strong's

**Phase 3 (v2.0.0):** Full Interlinear Support
- Embedded Strong's database (works offline)
- Interlinear view option
- Complete original language support

## User Experience Flow

**v1.2.0 with Strong's (example):**

1. User highlights "love" in John 21:15 (NIV)
2. App shows popup: "Would you like to link to original Greek? [Yes] [No]"
3. If Yes: Fetches Strong's G25 (agapao)
4. User adds note: "Selfless love - Jesus asking Peter"
5. Annotation saved with Strong's number
6. User switches to KJV
7. App shows highlight on "lovest" (same Strong's number)
8. Hover shows: "G25 - ἀγαπάω (agapao) - Selfless love"

## Technical Requirements

**For Strong's Integration:**
- Bible API with Strong's data OR
- Embedded Strong's JSON database (~5MB)
- Word-to-Strong's mapping per translation
- Graceful degradation if data unavailable

**Data Sources (Open/Free):**
- getbible.net - Free API, Strong's included
- openscriptures.org - Greek/Hebrew texts with Strong's
- bible-api.com - Limited but free

**Offline Option:**
- Download open-source Strong's database
- Embed in app as JSON
- ~5-10MB additional size
- Worth it for offline functionality

## Decision Points

1. **v1.1.0:** Keep word highlights simple (version-specific)?
   - YES - Don't overcomplicate initial release

2. **v1.2.0:** Add Strong's as optional enhancement?
   - MAYBE - Test user demand first

3. **Offline vs Online?**
   - Offline preferred (matches project philosophy)
   - Could bundle Strong's database

4. **UI Complexity?**
   - Make Strong's completely optional
   - Default UX same as current
   - "Enable original language features" in settings

## Next Steps

1. Research open Strong's databases (licensing, size, format)
2. Test Bible APIs with Strong's data
3. Prototype Strong's lookup UI
4. User test with Bible study groups
5. Decide if complexity worth the benefit

## Alternative: Just Link to External Tools

**Simplest approach:**
- When user highlights word, show "Look up in Blue Letter Bible" link
- Opens BLB interlinear for that verse
- User gets full Strong's/lexicon without building it ourselves
- Keeps app simple, leverages existing excellent tools

This might be the pragmatic v1.2.0 solution.

## Solution 5: Cross-Version Shadow Annotations (BEST)

**Concept:** When viewing a different Bible version, show annotations from other versions as "shadows"

**Example:**
- User highlights "love" in AFV (1 Cor 13:4)
- Switches to NIV
- NIV has different wording, so exact match impossible
- Margin shows: "📖 AFV: Highlighted 'love'"
- Clicking opens tooltip with AFV text and user's note

**Implementation:**
```json
{
  "verse": 4,
  "annotations": [
    {
      "type": "word-highlight",
      "sourceVersion": "AFV",
      "text": "love",
      "color": "yellow",
      "note": "Agape - selfless love",
      "startOffset": 23,
      "endOffset": 27
    }
  ]
}
```

**When viewing NIV:**
- Check for annotations from other versions on this verse
- If word-highlight doesn't match current text, show as margin indicator
- Indicator shows: "📖 [Version]: [annotation type] '[text]'"
- User can click to see full context

**Visual Design:**
```
Margin:  📖 AFV
Verse:   Love is patient, love is kind...
         (No highlight on NIV text)

On click margin icon:
┌─────────────────────────────┐
│ AFV Annotation              │
│ "love" - highlighted yellow │
│ Note: Agape - selfless love │
│                             │
│ AFV text:                   │
│ "Love is patient..."        │
└─────────────────────────────┘
```

**Pros:**
- No auto-matching needed
- User sees all annotations across versions
- Transparent - shows exactly what was annotated where
- No data loss when switching versions
- Could compare how different versions translate key words
- Simple to implement

**Cons:**
- Margin could get cluttered with many version-specific annotations
- Requires good UI for margin indicators

**User Workflow:**
1. Studying in AFV, highlight "love" with note about Greek
2. Switch to NIV to check different wording
3. See margin indicator: "📖 AFV: 'love'"
4. Click to read AFV note: "Agape - selfless love"
5. Now understand NIV's "love" in same context
6. Can add separate NIV highlight/note if desired

**This is brilliant because:**
- Solves the cross-version problem without AI/APIs/databases
- Actually more useful - shows user exactly which version they annotated
- Great for comparing translations
- No loss of information
- Works completely offline
- Simple UX

**Recommendation:** This for v1.2.0. It's the right balance of simplicity and power.
