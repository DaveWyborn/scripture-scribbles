# Scripture Scribbles - UI Improvements

## Margin Space for Cross-Version Annotations

**Current:** Margin only shows highlight/note/tag indicators for current version

**New:** Margin needs space for:
1. Current version annotations (highlights, notes, tags)
2. Cross-version "shadow" annotations (📖 AFV, 📖 NIV, etc.)

**Design Options:**

### Option 1: Stacked Icons
```
Margin (left side):
┌─────┐
│ 🟡  │ ← Current version highlight
│ 📝  │ ← Current version note
│📖AFV│ ← Shadow annotation from AFV
│📖NIV│ ← Shadow annotation from NIV
└─────┘
```

### Option 2: Grouped Indicators
```
Margin:
┌──────────┐
│ 🟡 📝    │ ← Current version
│ 📖 2     │ ← "2 other versions" (click to expand)
└──────────┘
```

### Option 3: Expandable Margin
```
Normal:     Expanded (on hover/click):
┌────┐      ┌─────────────────┐
│ 🟡 │      │ 🟡 Highlight    │
│ 📝 │  →   │ 📝 Note         │
│ +2 │      │ 📖 AFV: 'love'  │
└────┘      │ 📖 NIV: note    │
            └─────────────────┘
```

**Recommendation:** Option 3 - keeps margin clean, expands on interaction

## Verse Selection (Replace Hover)

**Problem:** Hover-to-show-actions doesn't work on mobile

**Solution:** Click-to-select verses, then show action toolbar

### User Flow:

**Desktop & Mobile:**
1. Click verse number → verse selected (highlight background)
2. Click another verse → multi-select (Shift+click for range)
3. Action toolbar appears (fixed position or floating)
4. Click action: highlight, note, tag, copy
5. Click elsewhere → deselect

**Visual Design:**
```
Before click:
###### 4
Love is patient, love is kind...

After click:
###### 4 ✓
[Love is patient, love is kind...]  ← Light blue background

Action Toolbar (appears at top or bottom):
┌────────────────────────────────────────────────┐
│ 🎨 Highlight  📝 Note  🏷️ Tag  📋 Copy  ✕ Clear │
└────────────────────────────────────────────────┘

Multiple verses selected:
###### 4 ✓
[Love is patient, love is kind...]
###### 5 ✓
[It does not envy, it does not boast...]

Toolbar shows:
┌─────────────────────────────────────────────────┐
│ 2 verses selected                                │
│ 🎨 Highlight  📝 Note  🏷️ Tag  📋 Copy  ✕ Clear  │
└─────────────────────────────────────────────────┘
```

### Benefits:
- ✅ Works on mobile and desktop
- ✅ Multi-verse selection easy
- ✅ Clear visual feedback
- ✅ Actions grouped in one place
- ✅ More accessible (keyboard navigation possible)

### Implementation Notes:
- Store selected verses in state: `selectedVerses = [4, 5, 6]`
- Toolbar position: sticky top or fixed bottom (mobile-friendly)
- Deselect: click background, Escape key, or "✕" in toolbar
- Shift+click for range select
- Ctrl/Cmd+click for multi-select

## Copy Verse Action

**Feature:** Copy selected verse(s) to clipboard

**Format Options:**

### Basic Format:
```
Love is patient, love is kind. It does not envy, it does not boast, it is not proud.
(1 Corinthians 13:4 AFV)
```

### With Reference:
```
1 Corinthians 13:4-5 (AFV)
Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.
```

### With Annotations:
```
1 Corinthians 13:4 (AFV)
Love is patient, love is kind.

Note: Agape - selfless, divine love
Tags: #love #character #fruit-of-spirit
```

**User Settings:**
- Copy format: Basic / With Reference / With Annotations
- Include version name: Yes / No
- Line breaks: Single / Double / None

**Implementation:**
```javascript
function copyVerses(verseNumbers) {
  const format = getUserCopyPreference(); // from settings
  let text = '';

  // Build reference
  const ref = `${currentBook} ${formatVerseRange(verseNumbers)} (${currentVersion})`;

  if (format !== 'basic') {
    text += ref + '\n';
  }

  // Add verse text
  verseNumbers.forEach(v => {
    text += getVerseText(v) + ' ';
  });

  // Add annotations if requested
  if (format === 'with-annotations') {
    // Add notes, tags, etc.
  }

  if (format === 'basic') {
    text += `\n(${ref})`;
  }

  navigator.clipboard.writeText(text);
  showToast('Verses copied!');
}
```

## Sermon Notes Feature

### Core Concept:
Persistent note-taking area separate from verse annotations, optimized for sermon/teaching context.

### UI Placement Options:

**Option 1: Bottom Panel**
```
┌────────────────────────────────────┐
│ Scripture Scribbles                │
├────────────────────────────────────┤
│                                    │
│ Bible Text Here                    │
│                                    │
│ (60-70% of screen)                 │
│                                    │
├────────────────────────────────────┤
│ Sermon Notes                   ▼▲  │ ← Collapsible
├────────────────────────────────────┤
│ Date: 2025-01-19                   │
│ Speaker: Pastor John                │
│ Passage: 1 Cor 13                  │
│                                    │
│ [Note taking area...]              │
│                                    │
└────────────────────────────────────┘
```

**Option 2: Right Sidebar (Desktop)**
```
┌──────────────────────┬─────────────┐
│ Scripture Scribbles  │ Sermons  ▼  │
├──────────────────────┼─────────────┤
│                      │ 📅 Today    │
│ Bible Text           │ 👤 Pastor J │
│                      │ 📖 1 Cor 13 │
│ (70% width)          │             │
│                      │ [Notes...]  │
│                      │             │
│                      │             │
└──────────────────────┴─────────────┘
```

**Option 3: Separate Tab/Mode**
```
Tabs: [📖 Bible] [📝 Sermon Notes]

When in Sermon Notes tab:
- Left: Bible reference/quick view
- Right: Full sermon notes editor
- Easy to paste verses from Bible tab
```

**Recommendation:** Bottom panel (mobile-friendly) + can toggle to sidebar on desktop

### Sermon Note Structure:

```json
{
  "id": "sermon-2025-01-19-grace",
  "date": "2025-01-19",
  "title": "Grace in Trials",
  "speaker": "Pastor John",
  "church": "Grace Community",
  "series": "1 Peter: Living Hope",
  "mainPassage": "1 Peter 1:3-9",
  "references": [
    "1 Peter 1:3-9",
    "James 1:2-4",
    "Romans 5:3-5"
  ],
  "content": "Markdown formatted notes...",
  "tags": ["trials", "grace", "hope"],
  "annotations": {
    // Link to specific verse annotations made during sermon
    "1 Peter 1:6": "annotation-id-123"
  }
}
```

### Sermon Notes Features:

**Basic (v1.1.0):**
- Create new sermon note
- Metadata: Date, speaker, passage, title
- Markdown editor
- Quick "Copy Verse" from Bible view → pastes into sermon notes
- Save/auto-save
- List of all sermon notes

**Advanced (v1.2.0):**
- Export individual sermon (Markdown, PDF)
- Export all sermons
- Search sermon notes
- Tag-based filtering
- Link to verse annotations
- Timeline view (by date/series)

### Export Format:

**Markdown Export:**
```markdown
# Grace in Trials

**Date:** January 19, 2025
**Speaker:** Pastor John
**Series:** 1 Peter: Living Hope
**Passage:** 1 Peter 1:3-9

## Main Points

### 1. Trials are temporary
> 1 Peter 1:6 (AFV)
> In this you greatly rejoice; but for the present, if it is necessary, you are in distress for a little while by various trials

### 2. Trials refine faith
...

## Application
-
-

## Questions
-

---
*Created with Scripture Scribbles*
```

**Export Options:**
- Single sermon → Markdown file
- All sermons → ZIP of markdown files
- Series → Combined markdown document
- Copy to clipboard (for pasting into Obsidian, Notion, etc.)

### Integration with Bible View:

**Primary Use Case: Following Along During Sermon**

The user is sitting in church with their device, trying to:
- Keep up with preacher jumping between passages
- Note which verses were referenced
- Take notes on what was said
- Mark key verses quickly

**Workflow:**
1. Sermon starts
2. User opens sermon notes panel
3. Quick metadata: Speaker (dropdown/recent), Date (auto)
4. Preacher says "Turn to Matthew 5:14"
5. User types "mat 5:14" in quick-add verse field
6. Verse inserted with full text
7. User adds note: "Christians are light - not option"
8. Preacher jumps to "Now look at John 8:12"
9. User types "joh 8:12" → inserted
10. Preacher continues in Matthew 5:15-16 but doesn't say it explicitly
11. User edits previous Matthew reference: changes "5:14" to "5:14-16"
12. Verse text updates automatically

**Quick Add Verse Field:**

```
Sermon Notes Panel:
┌────────────────────────────────────────────┐
│ 📅 Today  👤 Pastor John              [✕]  │
├────────────────────────────────────────────┤
│ Add verse: [mat 5:14________] [📖] [+ Add] │ ← Type or click 📖
├────────────────────────────────────────────┤
│                                            │
│ [[Matthew 5:14]]                      [✏️] │ ← Clickable markdown link
│ > You are the light of the world...        │
│                                            │
│ Christians are light - not option          │
│                                            │
│ [[John 8:12]]                         [✏️] │
│ > Then Jesus spoke to them again...        │
│                                            │
│ Jesus is THE light                         │
│                                            │
└────────────────────────────────────────────┘
```

**Two Input Methods:**

### Method 1: Type Reference (Power Users)
**Smart Verse Parser:**
Input → Result
- "mat 5:14" → Matthew 5:14
- "1 cor 13" → 1 Corinthians 13:1-13 (whole chapter)
- "rom 8:28-30" → Romans 8:28-30
- "gen 1:1" → Genesis 1:1
- "jn 3:16" → John 3:16
- Just "14" → Current chapter, verse 14 (if already in a book)

**Autocomplete Dropdown:**
As user types "mat 5":
```
┌──────────────────┐
│ Matthew 5        │ ← Chapter
│ Matthew 5:1      │
│ Matthew 5:14     │ ← Recently used
│ Matthew 5:16     │
└──────────────────┘
```

### Method 2: Visual Selector (e-Sword Style)

**Click 📖 icon → Multi-step selector modal:**

**Step 1: Select Book**
```
┌─────────────────────────────────────────┐
│ Select Book                         [✕] │
├─────────────────────────────────────────┤
│ Old Testament    │ New Testament        │
├──────────────────┼─────────────────────┤
│ Genesis          │ Matthew             │
│ Exodus           │ Mark                │
│ Leviticus        │ Luke                │
│ Numbers          │ John                │
│ Deuteronomy      │ Acts                │
│ Joshua           │ Romans              │
│ Judges           │ 1 Corinthians       │
│ Ruth             │ 2 Corinthians       │
│ 1 Samuel         │ Galatians           │
│ 2 Samuel         │ Ephesians           │
│ ...              │ ...                 │
└──────────────────┴─────────────────────┘
```

**Step 2: Select Chapter** (after clicking "Matthew")
```
┌──────────────────────────────────────┐
│ Matthew - Select Chapter         [✕] │
├──────────────────────────────────────┤
│  1   2   3   4   5   6   7   8   9  │
│ 10  11  12  13  14  15  16  17  18  │
│ 19  20  21  22  23  24  25  26  27  │
│ 28                                   │
└──────────────────────────────────────┘
```
(Only shows 28 numbers because Matthew has 28 chapters)

**For Navigation (Load Chapter): STOP HERE**
Click chapter number → load that chapter in main view

**For Sermon Notes (Add Verse): Continue to Step 3**

**Step 3: Select Verse** (after clicking "5")
```
┌──────────────────────────────────────┐
│ Matthew 5 - Select Verse         [✕] │
├──────────────────────────────────────┤
│  1   2   3   4   5   6   7   8   9  │
│ 10  11  12  13  14  15  16  17  18  │
│ 19  20  21  22  23  24  25  26  27  │
│ 28  29  30  31  32  33  34  35  36  │
│ 37  38  39  40  41  42  43  44  45  │
│ 46  47  48                           │
├──────────────────────────────────────┤
│              [Add] [Select End]      │
└──────────────────────────────────────┘
```
(Shows 48 numbers because Matthew 5 has 48 verses)

**Click verse 14:**
- Button changes to show: "Matthew 5:14" [Add] [Select End]

**Two options:**
1. **[Add]** → Inserts "Matthew 5:14" into sermon notes
2. **[Select End]** → Shows verse grid again to select end verse

**If Select End clicked, then verse 16:**
```
┌──────────────────────────────────────┐
│ Matthew 5 - Select End Verse     [✕] │
├──────────────────────────────────────┤
│  1   2   3   4   5   6   7   8   9  │
│ 10  11  12  13 [14] 15 [16] 17  18  │ ← 14 highlighted, 16 selected
│ 19  20  21  22  23  24  25  26  27  │
│ 28  29  30  31  32  33  34  35  36  │
│ 37  38  39  40  41  42  43  44  45  │
│ 46  47  48                           │
├──────────────────────────────────────┤
│       Matthew 5:14-16        [Add]   │
└──────────────────────────────────────┘
```

**Benefits of e-Sword Style:**
- ✅ No typing needed (mobile-friendly)
- ✅ Visual - easy to see book/chapter structure
- ✅ No memorizing abbreviations
- ✅ Context-aware (only shows relevant numbers)
- ✅ Range selection natural and clear
- ✅ Fast for touch interfaces
- ✅ Great for new users or unfamiliar books

**Keyboard Shortcuts:**
- Type reference, press Enter → Add verse
- Ctrl/Cmd + K → Focus quick-add field
- Already in notes → just type reference inline, auto-expands

**Edit Reference:**
Every inserted verse has small edit icon:
```
> Matthew 5:14 (AFV)  [✏️]
```

Click edit → inline editor:
```
Reference: [Matthew 5:14-16___] [Save] [Cancel]
```

Updates verse text immediately.

**Why This Matters:**

**Real scenario:**
```
Preacher: "Turn to Matthew 5, verse 14..."
[reads verse]
User: Types "mat 5:14" → inserted with text ✓

Preacher: "But really this whole section, verses 14 through 16, shows..."
[doesn't read them out]
User: Clicks edit → changes to "5:14-16" → text updates ✓

Preacher: "Now flip over to John chapter 8, I think it's verse 12..."
User: Types "joh 8:12" while preacher is still talking → inserted ✓

Preacher: "Actually, let me read from verse 10..."
User: Clicks edit → changes "8:12" to "8:10-12" ✓
```

**Copy to Sermon Notes (Alternative Method):**
When verses selected in main Bible view and sermon note active:
```
Action Toolbar:
┌────────────────────────────────────────────────────┐
│ 🎨 Highlight  📝 Note  🏷️ Tag  📋 Copy  ⬇️ To Sermon │
└────────────────────────────────────────────────────┘
```

Clicking "⬇️ To Sermon" inserts into sermon notes:
```markdown
> 1 Corinthians 13:4 (AFV)
> Love is patient, love is kind...

[Cursor here for user's notes]
```

**Two Ways to Add Verses:**
1. **Quick-add field** (fast, during sermon, preacher jumping around)
2. **Copy from Bible view** (when browsing, preparing, or reviewing)

Both methods produce editable verse blocks in sermon notes.

### Storage:

**File Structure:**
```
.annotations/
  └── Sermons/
      ├── sermon-2025-01-19-grace-in-trials.json
      ├── sermon-2025-01-12-living-hope.json
      └── sermon-index.json  ← List of all sermons
```

**Alternative (Markdown Storage):**
```
.annotations/
  └── Sermons/
      ├── 2025-01-19-grace-in-trials.md
      ├── 2025-01-12-living-hope.md
      └── index.json  ← Metadata only
```

**Recommendation:** Store as Markdown directly
- Easier export (already in right format)
- User can edit externally
- More portable
- JSON just for index/metadata

## Implementation Priority

**v1.1.0 (Next):**
1. ✅ Margin space for cross-version annotations
2. ✅ Click-to-select verses (replace hover)
3. ✅ Action toolbar for selected verses
4. ✅ Copy verse action
5. ✅ Basic sermon notes (bottom panel)
6. ✅ Sermon notes export (Markdown)

**v1.2.0:**
1. Sermon notes advanced features
2. Search/filter sermons
3. Series grouping
4. Better metadata handling

## Design Mockup Priorities

For tomorrow's design work, focus on:
1. **Verse selection visual** (selected state, multi-select)
2. **Action toolbar** (placement, icons, mobile-friendly)
3. **Sermon notes panel** (layout, metadata form, editor)
4. **Margin indicators** (cross-version annotations)
5. **Copy format settings** (preferences UI)

These are the UI changes needed to make all these features work well.
