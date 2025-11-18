# Scripture Scribbles Design System

**Based on:** Cava Design System (adapted for Bible study app)
**Philosophy:** Clean, accessible, dyslexia-friendly, mobile-first

---

## Design Tokens

### Colour Palette

#### Base Colours (Cava-inspired)

**Primary:**
- Orange: `#FFAD26` (buttons, icons, interactive elements)
- Black: `#000000` (copy/text on light backgrounds)
- Charcoal: `#282828` (dark backgrounds)

**Secondary:**
- Strawberry: `#FC4F59` (warnings, negative actions, errors)
- Mint: `#ACE5CB` (positive actions, success states)
- Sky: `#7AC7CC` (icons, highlighted objects, info)

**Neutrals:**
- Light Grey: `#EFEFF4` (strokes, light backgrounds)
- White: `#FFFFFF` (backgrounds, text on dark)
- Medium Grey: `#939393` (disabled buttons, disabled text)
- Sand: `#E8D7A5` (rare instances)
- Navy: `#3D5067` (rare instances)

---

### Theme System (6 Themes)

#### Light Themes

**1. Clean (Default Light)**
```css
--bg-primary: #FFFFFF
--bg-secondary: #EFEFF4
--text-primary: #000000
--text-secondary: #282828
--text-tertiary: #939393
--accent-primary: #FFAD26
--accent-positive: #ACE5CB
--accent-negative: #FC4F59
--accent-info: #7AC7CC
--border: #EFEFF4
--stroke: rgba(0,0,0,0.1)
```

**Annotation colours:**
- Yellow: `#FFD93D`
- Green: `#6BCF7F`
- Blue: `#4A90E2`
- Purple: `#9B6BDB`
- Orange: `#FF8C42`
- Pink: `#FF6B9D`

**2. Warm**
```css
--bg-primary: #FFF8F0
--bg-secondary: #F5E6D3
--text-primary: #2C1810
--text-secondary: #5C3D2E
--accent-primary: #D4843E (warmer orange)
--accent-positive: #8FBE9F
--accent-negative: #D9534F
--accent-info: #6AA9AE
```

**Annotation colours:**
- Amber: `#F4A261`
- Sage: `#84A98C`
- Periwinkle: `#8FA7D4`
- Lavender: `#B29BD3`
- Coral: `#E76F51`
- Rose: `#DE7C93`

**3. Dyslexia Light**
```css
--bg-primary: #FFFACD (light yellow)
--bg-secondary: #F0E68C
--text-primary: #000000
--text-secondary: #2C2C2C
--accent-primary: #FF9500 (high contrast orange)
--accent-positive: #00C853
--accent-negative: #E53935
--accent-info: #039BE5
```

**Annotation colours (high contrast):**
- Bright Yellow: `#FFEB3B`
- Bright Green: `#4CAF50`
- Bright Blue: `#2196F3`
- Bright Purple: `#9C27B0`
- Bright Orange: `#FF6F00`
- Bright Pink: `#E91E63`

---

#### Dark Themes

**4. True Dark (OLED)**
```css
--bg-primary: #000000
--bg-secondary: #1A1A1A
--text-primary: #FFFFFF
--text-secondary: #E0E0E0
--text-tertiary: #939393
--accent-primary: #FFAD26
--accent-positive: #ACE5CB
--accent-negative: #FC4F59
--accent-info: #7AC7CC
--border: #2C2C2C
--stroke: rgba(255,255,255,0.1)
```

**Annotation colours:**
- Yellow: `#FFD93D`
- Green: `#6BCF7F`
- Blue: `#4A90E2`
- Purple: `#9B6BDB`
- Orange: `#FF8C42`
- Pink: `#FF6B9D`

**5. Slate**
```css
--bg-primary: #1E1E1E
--bg-secondary: #2D2D2D
--text-primary: #E8E8E8
--text-secondary: #C8C8C8
--accent-primary: #FFAD26
--accent-positive: #8FBE9F
--accent-negative: #E86B6B
--accent-info: #6AA9AE
```

**Annotation colours (muted):**
- Mustard: `#D4AF37`
- Mint: `#5FA67F`
- Steel: `#5B7C99`
- Mauve: `#8B7BA8`
- Copper: `#D17948`
- Berry: `#C56B80`

**6. Dyslexia Dark**
```css
--bg-primary: #1A1A2E (dark blue-black)
--bg-secondary: #16213E
--text-primary: #FFFACD (cream)
--text-secondary: #F0E68C
--accent-primary: #FFB84D
--accent-positive: #4ADE80
--accent-negative: #FB5A5A
--accent-info: #38BDF8
```

**Annotation colours (high contrast on dark):**
- Bright Yellow: `#FDE047`
- Bright Green: `#86EFAC`
- Bright Blue: `#60A5FA`
- Bright Purple: `#C084FC`
- Bright Orange: `#FDBA74`
- Bright Pink: `#F472B6`

---

### Typography

**Font Family:**
```css
--font-primary: 'Avenir', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-dyslexic: 'OpenDyslexic', sans-serif
--font-mono: 'SF Mono', 'Consolas', monospace
```

**Font Sizes:**
```css
--text-header: 30pt / 40px
--text-header-alt: 24pt / 32px
--text-title: 24pt / 32px
--text-subhead: 18pt / 24px
--text-body: 14pt / 18.67px (default)
--text-button: 14pt / 18.67px
--text-label: 16pt / 21.33px (demi bold)
--text-caption: 12pt / 16px
```

**Font Weights:**
```css
--weight-regular: 400 (Avenir Roman)
--weight-medium: 500 (Avenir Demi Bold)
--weight-bold: 800 (Avenir Black)
--weight-book: 350 (Avenir Book - for longer text)
```

**Line Heights:**
```css
--line-height-tight: 1.2
--line-height-normal: 1.5
--line-height-relaxed: 1.8 (for dyslexia)
```

**Letter Spacing:**
```css
--letter-spacing-tight: -0.01em
--letter-spacing-normal: 0
--letter-spacing-wide: 0.05em (for dyslexia)
```

---

### Spacing System

**Scale (based on 4px base):**
```css
--space-xs: 4px
--space-s: 8px
--space-m: 16px
--space-l: 24px
--space-xl: 32px
--space-xxl: 48px
--space-xxxl: 64px
```

**Component-specific:**
```css
--padding-button: 12px 24px
--padding-field: 12px 16px
--padding-card: 16px
--padding-section: 24px
--margin-stack: 16px (between elements)
```

---

### Border Radius

```css
--radius-none: 0px
--radius-s: 4px
--radius-m: 8px
--radius-l: 12px
--radius-xl: 16px
--radius-pill: 999px (fully rounded)
```

---

### Component Styles

#### Buttons

**Standard button:**
```css
background: var(--accent-primary)
color: #FFFFFF
font: var(--text-button) var(--weight-medium)
padding: 12px 24px
border-radius: var(--radius-m)
border: none
text-transform: uppercase
letter-spacing: 0.5px
```

**States:**
- Pressed: Darken background by 10%
- Hover: Lighten background by 10%
- Inactive: `background: var(--text-tertiary)`, `color: white`

**Warning button:**
```css
background: var(--accent-negative)
```

**Positive button:**
```css
background: var(--accent-positive)
color: var(--text-primary)
```

**Long button:**
```css
width: 100%
max-width: 944px
```

**Square icon buttons:**
```css
width: 40px
height: 40px
padding: 8px
border-radius: var(--radius-m)
```

---

#### Form Fields

**Generic field:**
```css
background: var(--bg-primary)
border: 1px solid var(--border)
border-radius: var(--radius-m)
padding: 12px 16px
font: var(--text-body)
color: var(--text-primary)
```

**States:**
- Focused: `border: 2px solid var(--text-primary)`
- Success: `border: 2px solid var(--accent-positive)`, green checkmark icon
- Error: `border: 2px solid var(--accent-negative)`, red X icon

**Helper text:**
```css
font: var(--text-caption)
color: var(--text-tertiary)
margin-top: 4px
```

**With action button:**
- Field has right padding for button
- Button attached to right side (8px from edge)

---

#### Icons

**Sizes:**
```css
--icon-s: 16px
--icon-m: 24px
--icon-l: 32px
--icon-xl: 48px
```

**Colours (from Cava palette):**
- Primary actions: Orange `#FFAD26`
- Positive: Mint `#ACE5CB`
- Negative: Strawberry `#FC4F59`
- Info: Sky `#7AC7CC`
- Default: Black/White (theme dependent)
- Disabled: Medium Grey `#939393`

**Icon style:** Simple, rounded, 2px stroke weight

---

### Bible Reader Specific

#### Verse Display

**Verse number:**
```css
font: var(--text-caption)
color: var(--text-tertiary)
font-variant-numeric: tabular-nums
margin-right: 8px
display: inline-block
min-width: 24px
```

**Verse text:**
```css
font: var(--text-body) (user adjustable 12-32px)
font-family: var(--font-primary) (user selectable)
line-height: var(--line-height-normal) (user adjustable)
color: var(--text-primary)
```

**Selected verse:**
```css
background: var(--bg-secondary)
border: 2px solid var(--accent-primary)
border-radius: var(--radius-m)
padding: 8px
```

---

#### Margin Annotations

**Icon positioning:**
```css
position: absolute
left: -32px
top: 0
width: 24px
height: 24px
```

**Note icon:** 📝 (or custom icon)
**Tag icon:** 🏷️ (or custom icon)

**Visibility modes:**

**On (full visibility):**
- Icons: Full colour, 100% opacity
- Highlights: Full colour background
- Tags: Full colour badges

**Subtle:**
- Icons: Greyscale, 60% opacity
- Highlights: Underline only (2px solid, matching colour)
- Tags: Greyscale text, outlined

**Off:**
- Icons: Hidden
- Highlights: Hidden
- Tags: Hidden

---

#### Annotation Panel (Bottom Popup)

**Container:**
```css
position: fixed
bottom: 0
left: 50%
transform: translateX(-50%)
width: 100%
max-width: 600px
max-height: 50vh
background: var(--bg-primary)
border-radius: 16px 16px 0 0
box-shadow: 0 -4px 20px rgba(0,0,0,0.15)
padding: 16px
overflow-y: auto
```

**Drag handle:**
```css
width: 40px
height: 4px
background: var(--text-tertiary)
border-radius: 2px
margin: 0 auto 16px
```

**Highlight colour picker:**
- 6 colour swatches
- 32px × 32px each
- 8px spacing
- Rounded (border-radius: 4px)
- Active state: 2px border (white/black)

---

#### Navigation Grid

**Book selector:**
```css
display: grid
grid-template-columns: repeat(6, 1fr)
gap: 8px
```

**Book button:**
```css
aspect-ratio: 1
padding: 8px
background: var(--bg-secondary)
border-radius: var(--radius-m)
font: var(--text-label)
text-align: center
border: 2px solid transparent
```

**Book button (active):**
```css
border-color: var(--accent-primary)
background: var(--accent-primary)
color: white
```

**Testament sections:**
- Old Testament: Warm gradient (orange → yellow)
- New Testament: Cool gradient (blue → teal)

**Chapter selector:**
```css
display: grid
grid-template-columns: repeat(auto-fill, minmax(48px, 1fr))
gap: 8px
```

---

### Mobile Considerations

**Breakpoints:**
```css
--mobile: 0-767px
--tablet: 768px-1023px
--desktop: 1024px+
```

**Touch targets:**
- Minimum: 44px × 44px
- Preferred: 48px × 48px
- Spacing: 8px minimum between

**Font size adjustments (mobile):**
```css
--text-body: 16px (increased from 14px for readability)
```

---

### Accessibility

**Contrast ratios (WCAG AA):**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

**Focus states:**
```css
outline: 2px solid var(--accent-primary)
outline-offset: 2px
```

**Dyslexia-friendly settings:**
- OpenDyslexic font option
- Increased letter spacing (0.05em)
- Increased line height (1.8)
- High contrast colour options
- Yellow/cream backgrounds (proven effective)

---

### Animation

**Transitions:**
```css
--transition-fast: 150ms ease-in-out
--transition-normal: 250ms ease-in-out
--transition-slow: 350ms ease-in-out
```

**Common uses:**
- Button hover/press: `var(--transition-fast)`
- Panel slide-up: `var(--transition-normal)`
- Page transitions: `var(--transition-slow)`

**Easing:**
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-out: cubic-bezier(0.0, 0, 0.2, 1)
--ease-in: cubic-bezier(0.4, 0, 1, 1)
```

---

## Component Library

### Cards

**Standard card:**
```css
background: var(--bg-primary)
border: 1px solid var(--border)
border-radius: var(--radius-l)
padding: 16px
box-shadow: 0 2px 8px rgba(0,0,0,0.05)
```

**Collapsible card:**
- Header: 48px height
- Chevron icon (right aligned)
- Content: Slides down with `var(--transition-normal)`

---

### Modals/Dialogs

**Overlay:**
```css
background: rgba(0,0,0,0.5)
backdrop-filter: blur(4px)
```

**Dialog:**
```css
background: var(--bg-primary)
border-radius: var(--radius-xl)
padding: 24px
max-width: 500px
margin: 0 auto
box-shadow: 0 8px 32px rgba(0,0,0,0.2)
```

---

### Dropdown/Select

**Container:**
```css
position: relative
background: var(--bg-primary)
border: 1px solid var(--border)
border-radius: var(--radius-m)
padding: 12px 16px
```

**Options list:**
```css
position: absolute
top: 100%
margin-top: 4px
width: 100%
max-height: 300px
overflow-y: auto
background: var(--bg-primary)
border: 1px solid var(--border)
border-radius: var(--radius-m)
box-shadow: 0 4px 16px rgba(0,0,0,0.1)
```

**Option:**
```css
padding: 12px 16px
cursor: pointer
```

**Option (hover):**
```css
background: var(--bg-secondary)
```

---

### Warning/Alert Banners

**Warning (Cava red modal):**
```css
background: var(--accent-negative)
color: white
padding: 24px
border-radius: var(--radius-l)
text-align: center
```

**Icon:**
- Clock/warning icon centred
- 64px size
- Dark circle background

**Text:**
```css
font: var(--text-body)
margin: 16px 0
```

**Actions:**
- Primary button (orange on red background)
- Secondary button (text only, white)

---

## Usage Examples

### Bible Verse Rendering

```html
<div class="verse" data-verse="1">
  <div class="verse-annotation-icons">
    <span class="icon-note">📝</span>
    <span class="icon-tag">🏷️</span>
  </div>
  <span class="verse-number">1</span>
  <span class="verse-text" data-highlight="yellow">
    In the beginning God created the heavens and the earth.
  </span>
</div>
```

**CSS:**
```css
.verse {
  position: relative;
  padding-left: 40px;
  margin-bottom: 8px;
  line-height: var(--line-height-normal);
}

.verse-annotation-icons {
  position: absolute;
  left: 0;
  display: flex;
  gap: 4px;
}

.verse-number {
  font-size: var(--text-caption);
  color: var(--text-tertiary);
  margin-right: 8px;
  min-width: 24px;
  display: inline-block;
}

.verse-text[data-highlight="yellow"] {
  background: #FFD93D;
  padding: 2px 4px;
  border-radius: 2px;
}
```

---

### Annotation Panel

```html
<div class="annotation-panel">
  <div class="drag-handle"></div>
  <h3>Genesis 1:1</h3>

  <div class="highlight-picker">
    <button class="colour-swatch" data-colour="yellow"></button>
    <button class="colour-swatch" data-colour="green"></button>
    <button class="colour-swatch" data-colour="blue"></button>
    <button class="colour-swatch" data-colour="purple"></button>
    <button class="colour-swatch" data-colour="orange"></button>
    <button class="colour-swatch" data-colour="pink"></button>
  </div>

  <textarea class="note-input" placeholder="Add note..."></textarea>

  <div class="tag-input">
    <input type="text" placeholder="Add tag...">
    <div class="tag-suggestions">
      <button class="tag-suggestion">Creation</button>
      <button class="tag-suggestion">Beginning</button>
    </div>
  </div>

  <button class="btn-primary">Save</button>
</div>
```

---

## Implementation Priority

### Phase 1 (v1.1.0): Core Components
- [x] Colour tokens (all 6 themes)
- [x] Typography system
- [ ] Button styles
- [ ] Form fields
- [ ] Icons set

### Phase 2 (v1.2.0): Bible Reader
- [ ] Verse rendering
- [ ] Annotation icons
- [ ] Highlight system
- [ ] Annotation panel
- [ ] Visibility modes

### Phase 3 (v1.3.0): Navigation
- [ ] Grid navigation (books/chapters)
- [ ] Dropdown components
- [ ] Modal/dialog
- [ ] Settings panel

### Phase 4 (v1.4.0+): Advanced
- [ ] Cards/collapsibles
- [ ] Warning banners
- [ ] Toast notifications
- [ ] Loading states

---

## Design Principles Summary

1. **Clarity over cleverness** - Simple, obvious interactions
2. **Touch-first** - 48px targets, generous spacing
3. **Readable by default** - Excellent typography, high contrast
4. **Flexible for dyslexia** - Font/colour/spacing controls
5. **Consistent spacing** - 8px grid system
6. **Purposeful colour** - Orange = action, Red = warning, Green = success
7. **Accessible** - WCAG AA minimum, keyboard navigation
8. **Mobile-friendly** - Responsive, works on small screens

---

**Reference files:**
- `CAVA_design_system/Colors.png`
- `CAVA_design_system/Text.png`
- `CAVA_design_system/Butons.png`
- `CAVA_design_system/Feilds.png`
- `CAVA_design_system/Icons.png`
- `CAVA_design_system/Components.jpg`
