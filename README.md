# Scripture Scribbles

**Your Bible. Your Notes. Beautiful Reading.**

A dyslexia-friendly Bible reading app with rich annotations, focus tools, and sermon notes. Anti-YouVersion -- minimal, beautiful, accessible.

[scripturescribbles.co.uk](https://scripturescribbles.co.uk)

---

## Features

### Reading
- **Fluid reading mode** -- natural paragraphs, not verse-by-verse blocks
- **Passage mode** -- smart chunking with position save/restore
- **Reading bar** -- draggable focus aid with 3 styles (ruler, highlight, underline)
- **Reading history** -- track chapters and sections read
- **Scroll navigation** -- section outline for quick jumping

### Accessibility
- **Dyslexia typography** -- OpenDyslexic, Atkinson Hyperlegible, system fonts
- **Full spacing control** -- font size (up to 42px), line height, letter spacing, word spacing
- **24 themes** -- light, dark, high contrast, dyslexia-optimised presets
- **Custom colours** -- background and text colour pickers

### Annotations
- **6-colour highlighting** with underline option
- **Verse notes** with range support
- **Tags** with colour coding
- **Multiple annotation sets** -- Study, Church, Home Group, Personal
- **3 display modes** -- full, subtle (greyscale), hidden

### Sermon Notes
- **Rich text editor** (Trix) with formatting toolbar
- **Split-view** -- Bible + notes side by side (desktop)
- **Mobile tabs** -- swipe between Bible and notes
- **Verse insertion** from current chapter
- **Cloud sync** via Supabase

### Cloud Sync
- **Supabase backend** -- email + Google OAuth
- **Auto-sync** annotations and sermon notes
- **Works across devices**
- **Offline-first** -- IndexedDB local storage with cloud backup

### Export
- **Markdown** -- formatted for Obsidian
- **JSON** -- full data backup

---

## Stack

- Vanilla JS, no framework, no build step
- Supabase (auth + cloud sync)
- GitHub Pages + Cloudflare DNS
- WEB Bible (public domain, bundled as enhanced JSON)

---

## Bible Versions

Bundled (public domain, offline):
- **WEB** -- World English Bible (default)
- **ASV** -- American Standard Version
- **KJV** -- King James Version

---

## Development

```bash
# Local dev server
python3 -m http.server 8000

# Convert USFM source to enhanced JSON
node usfm-converter.js /path/to/usfm output.json
```

### File Structure

```
scripture-scribbles-v1.3.html   -- main app entry point
index.html                      -- landing page
preview.html                    -- redirects to current version
js/                             -- 15 JS modules
css/                            -- 4 stylesheets (base, components, themes, sermons)
data/                           -- bundled Bible JSON (gzipped)
WEB/                            -- USFM source files
```

### Technical References
- `BIBLE-JSON-FORMAT.md` -- enhanced JSON schema
- `BIBLE-VERSION-INTEGRATION-GUIDE.md` -- adding new Bible versions
- `SUPABASE-SETUP-GUIDE.md` -- database and RLS setup

---

## Roadmap

See the [public roadmap](https://scripturescribbles.co.uk/roadmap) for upcoming features and voting.

**Current version:** v1.4.0

---

## Support

- [Report a bug](https://github.com/DaveWyborn/scripture-scribbles/issues)
- [Buy us a coffee](https://www.buymeacoffee.com/scripturescribbles)

---

## Licence

MIT -- see [LICENSE](LICENSE) for details.

**Made for the glory of God and the edification of His church.**
