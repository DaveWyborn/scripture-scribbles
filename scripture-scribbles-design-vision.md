# Scripture Scribbles - Complete Design Vision

## Core Mission: Dyslexia-Friendly Bible Study

**Primary user:** Christians with dyslexia who struggle with traditional Bible reading and note-taking

**Key insight:** Dyslexia makes text processing hard. Physical highlighting in paper Bibles is permanent and requires commitment. Digital allows flexibility, experimentation, multiple methods without losing original text.

---

## Design System: Cava-Inspired

**Reference:** https://blakewilton.com/Cava-Design-System

**Key elements to adopt:**
- Clean, modern interface
- Clear hierarchy
- Bold but simple color system
- Mobile-first approach
- Accessibility-focused
- Consistent spacing and typography

**To develop:**
- 3 light themes
- 3 dark themes
- User can switch easily
- Each theme defines annotation colors

---

## Dyslexia-Friendly Features

### Typography (Priority 1)

**Font selection (4-5 options):**
1. OpenDyslexic (primary for dyslexia)
2. Atkinson Hyperlegible
3. System serif (Georgia/Times)
4. System sans-serif (Arial/Helvetica)
5. Optional: Comic Sans (proven helpful for some)

**Font controls:**
- Size: Full range (12px - 32px+)
- Weight: Regular/Bold toggle
- Line height: Adjustable
- Letter spacing: Adjustable

### Color Controls (Priority 1)

**Full customization:**
- Background color picker
- Text color picker
- Link color picker
- Annotation colors

**Built-in themes:**
- Light: High contrast, cream backgrounds, sepia
- Dark: True black, dark grey, blue-black
- Dyslexia-optimized: Yellow on black, cream on dark blue

**Consider:** Catppuccin color palette (mentioned in ideas.md)

### Audio Reader (Priority 2 - Future)

**Implementation:**
- AI voice API (high quality)
- Tiered pricing based on minutes/day

**Free tier:**
- Basic voice
- 30 minutes/day average (not hard limit)
- Can go to 45 minutes some days
- Average calculated over rolling 7 days

**Flexible limits:**
- Allow finishing chapter/book (natural stopping point)
- Don't cut off mid-verse

**Upgrade prompts:**
- If averaging over 45 min/day consistently
- "You're averaging 45 minutes per day. Your current plan is for 30 minutes. Upgrade?"
  - For today only
  - For this week
  - Permanent upgrade
  - No thank you

**Fair pricing philosophy:**
- Auto-downgrade if usage drops (3-month average)
- Auto-pause if inactive 3 months
- Notify before changes
- "Christian values: fair, not exploitative"

---

## Bible Reader View

### Layout (Reference: bible_view.png)

**Key principles:**
1. **Margin annotations** - Notes and tags appear in margin as icons
2. **Select to expand** - Click verse to show full notes/tags below it
3. **Minimal clutter** - Only show what's needed
4. **Clean reading** - Text is primary, annotations secondary

**Verse states:**

**Normal (no selection):**
```
Margin: [icons if annotations exist]
Text:   Verse text (highlighted if applicable)
```

**Selected:**
```
Margin: [icons]
Text:   [Verse text in selection box]

        Tags: [tag] [tag] [tag] (horizontal list)
        Note: Full note text here

        [Edit] [Delete] icons (subtle)
```

**Example from screenshot:**
- Verse 1: Selected (box around it)
- Verse 2: Full verse highlight (green) + note icon in margin
- Verse 3: Two tags + word highlight on "came"
- Verse 4: Single tag
- Verse 5: Tag + note
- Verse 6: Selected, showing 2 tags + note expanded below

### Annotation Visibility (Simplified)

**Current:** Too many options (show highlights, show markers, show backgrounds, etc.)

**New: 3 modes only**

1. **On** - Fully visible, full color, margin icons prominent
2. **Subtle** - Muted colors/greyscale, highlights become underlines, icons smaller
3. **Off** - No annotations visible at all (clean reading)

Toggle easily between modes. Helps dyslexic users reduce visual noise when needed.

---

## Highlighting System

### Word vs Verse Highlighting

**Both supported** - flexibility is key for different study methods

**Interaction rules:**

1. **Word highlight → then verse highlight (same color):**
   - Word absorbed into verse highlight

2. **Word highlight → then verse highlight (different color):**
   - Both visible, word highlight on top

3. **Verse highlight → then word highlight (different color):**
   - Word highlight visible on top of verse

4. **Clear verse highlight:**
   - If only verse highlighting exists → clears verse
   - If both exist → clears verse, leaves word highlights
   - If only word highlights exist → clears words

5. **Clear word highlight:**
   - Removes word highlight
   - If verse highlight exists, word reverts to verse color

**Last one wins** - Most recent action takes precedence

**Visual hierarchy:**
- Word highlights > Verse highlights
- Multiple word highlights per verse allowed
- Color mixing/layering should be clear

### Color Selection (Reference: IMG_2281.PNG)

**Bottom toolbar when text selected:**
```
[U] [🔵] [🟡] [🔴] [🟢] [🟠] [🟣]
 ↑   ↑---- Color palette (theme-based)
Underline
```

**Actions bar:**
```
[Copy] [Explain] [Note] [Compare] [Save] [Share]
```

Note: "Explain" and "Compare" are interesting features from that app - consider for future

---

## Navigation System

### Book/Chapter/Verse Selector (Reference: IMG_2278-2279)

**Visual grid navigation** (like e-Sword, shown in screenshots)

**Step 1: Book Selection**
```
┌─────────────────────────────────────┐
│ Bible Navigation            [X] [⚙] │
├─────────────────────────────────────┤
│ 📖 Mark 1                      [GO] │ ← Current location
├─────────────────────────────────────┤
│  [BOOK]  [CHAPTER]                  │ ← Tabs
├─────────────────────────────────────┤
│ GEN   EX   LEV   NUM   DEU   JOS   │ ← Old Testament
│ JDG   RTH  1SA   2SA   1KI   2KI   │   (color coded)
│ 1CH   2CH  EZR   NEH   EST   JOB   │
│ PSA   PRV  ECC   SOS   ISA   JER   │
│ ...                                 │
├─────────────────────────────────────┤
│ MAT   MRK  LUK   JN    ACT   ROM   │ ← New Testament
│ 1CO   2CO  GAL   EPH   PHP   COL   │   (different color)
│ 1TH   2TH  1TI   2TI   TIT   PHM   │
│ HEB   JAM  1PE   2PE   1JN   2JN   │
│ 3JN   JUD  REV                      │
└─────────────────────────────────────┘
```

**Color coding:**
- Old Testament: Warmer colors (red, orange, yellow gradient)
- New Testament: Cooler colors (blue, teal, purple gradient)
- Law: One color family
- Prophets: Another color family
- Gospels: Unified color
- Epistles: Related colors

**Step 2: Chapter Selection** (after clicking book)
```
┌─────────────────────────────────────┐
│ Bible Navigation            [X] [⚙] │
├─────────────────────────────────────┤
│ 📖 Daniel 1                    [GO] │
├─────────────────────────────────────┤
│  [BOOK]  [CHAPTER]                  │ ← Chapter tab active
├─────────────────────────────────────┤
│ Daniel                              │
│                                     │
│  1   2   3   4   5   6             │
│  7   8   9   10  11  12            │ ← Only 12 shown (Daniel has 12)
│                                     │
└─────────────────────────────────────┘
```

**For navigation:** Stop here, click number → load chapter

**For verse selection (sermon notes):** Continue to Step 3

**Step 3: Verse Selection**
```
┌─────────────────────────────────────┐
│ Daniel 9 - Select Verse     [X]     │
├─────────────────────────────────────┤
│  1   2   3   4   5   6   7   8     │
│  9   10  11  12  13  14  15  16    │
│  17  18  19  20  21  22  23  24    │
│  25  26  27                         │ ← Only 27 (Daniel 9 has 27)
├─────────────────────────────────────┤
│              [Add] [Select End]      │
└─────────────────────────────────────┘
```

Click verse → [Add] or [Select End] for range

**Benefits:**
- ✅ No typing needed (dyslexia-friendly)
- ✅ Mobile-friendly (large touch targets)
- ✅ Visual (can see book structure)
- ✅ Context-aware (only valid numbers shown)
- ✅ Beautiful color coding

---

## Sermon Notes

### Layout

**Desktop:** Side-by-side
```
┌──────────────────┬───────────────────┐
│                  │                   │
│  Bible Reader    │  Sermon Notes     │
│  (60%)           │  (40%)            │
│                  │                   │
└──────────────────┴───────────────────┘
```

**Mobile:** Swipe left/right to switch
```
[Bible] ← swipe → [Sermon Notes]
```

**Not:** Swipe for next chapter (conflict)
**Instead:** Scroll to bottom, intentional scroll down → next chapter

### Editor Interface

**Large, clean text area:**
```
┌─────────────────────────────────────┐
│ Sermon Notes - January 19, 2025     │
├─────────────────────────────────────┤
│ [#] [B] [I] [[[[ ]]]] [•] [1.]     │ ← Minimal toolbar
│                                     │
│                                     │
│                                     │
│   Large, clean text area            │
│   Markdown formatting               │
│   Minimal distractions              │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

**Toolbar buttons:**
- [#] - Insert heading
- [B] - Bold
- [I] - Italic
- [[[[ ]]]] - Insert wikilink (cursor in middle)
- [•] - Bullet list
- [1.] - Numbered list

**Quick verse insert:**
```
[📖 Add Verse] [Quick Paste]
```

### Templates

**YAML frontmatter support:**
```yaml
---
speaker: Pastor John
date: 2025-01-19
location: Grace Community Church
series: 1 Peter - Living Hope
passage: 1 Peter 1:3-9
tags: [trials, hope, faith]
---

# Grace in Trials

## Main Points

### 1. Trials are temporary

[[1 Peter 1:6]]
> In this you greatly rejoice...

Note: Comparison to gold refining
```

**Template options:**
- Basic sermon
- Series sermon (includes series field)
- Teaching (classroom/study)
- Personal devotion

### Verse Formatting Options

**User selects in settings:**

**Option 1: Reference first**
```
Romans 1:6 (AFV)
"In Whom you also are called of Jesus Christ:"
```

**Option 2: Verse first**
```
"In Whom you also are called of Jesus Christ:"
Romans 1:6 (AFV)
```

**Option 3: Inline**
```
"In Whom you also are called of Jesus Christ:" (Romans 1:6, AFV)
```

**Option 4: Block quote**
```
> Romans 1:6 (AFV)
> In Whom you also are called of Jesus Christ:
```

---

## Tags System

### Visual Design (Margin Icons)

**In margin when verse has tags:**
```
[🏷️] ← Click to see all tags
```

**When verse selected:**
```
Tags: [Jesus] [Prayer] [Faith]
      ↑       ↑        ↑
    Purple   Blue    Yellow (color-coded)
```

### Tag Creation

**When adding tag:**
```
┌──────────────────────────────────┐
│ Add Tag                          │
├──────────────────────────────────┤
│ Tag name: [____________]         │
│                                  │
│ Color: [🔵] [🟢] [🟡] [🔴] [🟣] │ ← Theme colors
│                                  │
│ Recent tags:                     │
│ [Jesus] [Prayer] [Faith]         │ ← Click to reuse
│ [Love] [Grace] [Hope]            │
│                                  │
│           [Cancel] [Add]         │
└──────────────────────────────────┘
```

**Benefits:**
- See previously used tags (consistency)
- Each tag has color (visual organization)
- Colors from theme (coherent design)

### Tag Management

**Settings → Tags:**
```
┌──────────────────────────────────┐
│ Manage Tags                      │
├──────────────────────────────────┤
│ [Jesus]     Purple   15 uses     │ [Edit] [Delete]
│ [Prayer]    Blue     8 uses      │ [Edit] [Delete]
│ [Faith]     Yellow   12 uses     │ [Edit] [Delete]
│ [Love]      Red      6 uses      │ [Edit] [Delete]
│                                  │
│ [+ Create Tag]                   │
└──────────────────────────────────┘
```

**Edit tag:**
- Rename (updates all uses)
- Change color (updates all uses)
- Merge with another tag
- Delete (confirm first)

---

## Home Screen

**Clean, simple, clear actions:**

```
┌─────────────────────────────────────┐
│                                     │
│    Scripture Scribbles              │
│                                     │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │   [📖 Bible Reader]     │     │
│    │                         │     │
│    └─────────────────────────┘     │
│                                     │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │   [📝 Sermon Notes]     │     │
│    │   • New note            │     │
│    │   • Open existing       │     │
│    │   • Load template       │     │
│    │                         │     │
│    └─────────────────────────┘     │
│                                     │
│    ┌─────────────────────────┐     │
│    │   [🏷️ Manage Tags]      │     │
│    └─────────────────────────┘     │
│                                     │
│    ┌─────────────────────────┐     │
│    │   [🎨 Themes]           │     │
│    └─────────────────────────┘     │
│                                     │
│    ┌─────────────────────────┐     │
│    │   [⚙️ Settings]         │     │
│    └─────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

**Simple, clear, big touch targets**

---

## Reader Toolbar (Reference: IMG_2280)

**Top toolbar when reading:**
```
[🕐] [🔊] [Dan 9] [VoiceSB] [Voice ▼] [👤]
  ↑    ↑     ↑       ↑         ↑        ↑
History Audio Location Bible  Voice  Account
                      version  settings
```

**Features shown:**
- History (go back to previous location)
- Audio reader (play/pause)
- Current location (tap to navigate)
- Bible version switcher
- Voice settings (when audio enabled)
- Account/profile

**Bottom navigation (optional):**
```
[Home] [Bible] [Search] [Plans] [More]
```

Or keep it minimal - just Bible reader focus

---

## Implementation Priorities

### Phase 1 (v1.1.0): Foundation
1. ✅ Supabase auth + sync
2. ✅ WEB Bible integration
3. ✅ Visual navigation (book/chapter grid)
4. ✅ Click-to-select verses
5. ✅ Margin annotations design
6. ✅ Basic highlighting (verse + word)
7. ✅ 3-mode visibility (On/Subtle/Off)

### Phase 2 (v1.2.0): Dyslexia Features
1. Font selection (4-5 options including OpenDyslexic)
2. Full color customization
3. 3 light + 3 dark themes
4. Font size/weight/spacing controls
5. Sermon notes (side-by-side on desktop)
6. Tag system with colors

### Phase 3 (v1.3.0): Audio + Premium
1. AI audio reader integration
2. Usage tracking (minutes/day)
3. Tiered pricing
4. Fair auto-downgrade/pause system
5. Premium features

### Phase 4 (v2.0.0): Advanced
1. Additional Bible versions
2. Cross-version annotation shadows
3. Collaboration features
4. Advanced search
5. Mobile apps (native)

---

## Design System Specifications

### To Be Developed (Based on Cava)

**Typography scale:**
- H1: 32px
- H2: 24px
- H3: 20px
- Body: 16px (adjustable for reader)
- Small: 14px
- Tiny: 12px

**Spacing scale:**
- XS: 4px
- S: 8px
- M: 16px
- L: 24px
- XL: 32px
- XXL: 48px

**Border radius:**
- Small: 4px
- Medium: 8px
- Large: 12px
- XL: 16px

**Colors:**
- Primary: TBD (from Cava inspiration)
- Secondary: TBD
- Accent: TBD
- Success, Warning, Error, Info: TBD
- Annotation palette: 6-8 colors per theme

**Themes (6 total):**

*Light themes:*
1. Clean (high contrast, white background)
2. Warm (cream/sepia tones)
3. Dyslexia (yellow highlights, optimized contrast)

*Dark themes:*
1. True Dark (OLED black)
2. Slate (dark grey, easier on eyes)
3. Dyslexia Dark (optimized for dyslexic users)

---

## Summary: What Makes This Different

**For dyslexic users:**
- Font flexibility (OpenDyslexic)
- Full color control
- Audio reading option
- Reduced visual clutter (3-mode system)
- Large, clear UI elements

**For note-takers:**
- Multiple annotation sets (no commitment anxiety)
- Flexible highlighting (word + verse)
- Margin design (clean text)
- Sermon notes integrated

**For everyone:**
- Beautiful, modern design (Cava-inspired)
- Mobile-first (visual navigation)
- Fair pricing (Christian values)
- Accessible, inclusive

**Philosophy:**
Make Bible study accessible to those who struggle with traditional methods, while creating something beautiful and useful for everyone.
