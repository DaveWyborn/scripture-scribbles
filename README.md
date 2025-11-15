# 📖 Scripture Scribbles

**Your Bible. Your Notes. Your Device.**

A local-first Bible study tool that keeps everything private and works perfectly with Obsidian markdown files.

🔗 **Live App:** [scripturescribbles.co.uk](https://scripturescribbles.co.uk)

---

## ✨ Features

- 🎨 **Rich Annotations** - 6 highlight colours, detailed notes, verse tags
- 💾 **Auto-Save** - Everything saves automatically, never lose your work
- 🔒 **100% Private** - No cloud, no tracking, no accounts - all data stays on your device
- 📚 **Multiple Sets** - Separate annotations for Study, Church, Home Group, and Personal
- ⚡ **Lightning Fast** - Works entirely offline, no internet required
- 🆓 **Forever Free** - Open source, no subscriptions, no hidden costs

---

## 🎯 Perfect for Obsidian Users

Already using Bible markdown files in Obsidian? Scripture Scribbles works seamlessly:

- ✅ Use your existing Bible markdown files
- ✅ Files stay completely untouched
- ✅ Annotations saved separately in JSON format
- ✅ Keep using Obsidian for everything else

---

## 🚀 Getting Started

1. **Open the app** - Visit [scripturescribbles.co.uk](https://scripturescribbles.co.uk)
2. **Select your Bible folder** - Navigate to your markdown Bible files
3. **Grant permissions** - Allow browser to access your files
4. **Start studying** - Highlight, annotate, and tag verses

### Requirements

- Chrome, Edge, or Brave browser (uses File System Access API)
- Bible files in markdown format (one chapter per file)
- Read/write permissions to your Bible folder

---

## 📂 File Structure

Your Bible folder should look like this:

```
Scripture/
└── Your Bible Name/
    ├── 001 - Genesis/
    │   ├── Genesis 1.md
    │   ├── Genesis 2.md
    │   └── ...
    ├── 046 - 1 Peter/
    │   ├── 1 Peter 1.md
    │   ├── 1 Peter 2.md
    │   └── ...
    └── .annotations/          ← Created automatically
        ├── Study/
        │   ├── 001-Genesis.json
        │   └── 046-1-Peter.json
        ├── Church/
        ├── HomeGroup/
        └── Personal/
```

All your annotations are saved in the `.annotations/` folder, organised by annotation set.

---

## 🎨 How to Use

### Highlighting

- **Full verse**: Hover over verse number → click 🎨 → choose colour
- **Specific text**: Select text → choose colour from floating toolbar
- **Clear**: Hover over verse number → click 🎨 → click ✕

### Notes

- Hover over verse number → click 📝
- Enter your note text
- Optionally specify verse range (e.g., "9-12")
- Press Cmd/Ctrl+Enter to save

### Tags

- Hover over verse number → click 🏷️
- Type tags (auto-adds # if needed)
- Press Tab to add multiple tags
- Press Cmd/Ctrl+Enter to save

### Annotation Sets

Switch between different annotation contexts using the dropdown:
- **Study** - Personal Bible study
- **Church** - Sermon notes
- **Home Group** - Group study
- **Personal** - Private devotions

Each set maintains completely separate annotations!

---

## 🛠️ Technology

- **100% Client-Side** - Pure HTML/CSS/JavaScript
- **File System Access API** - Direct access to local files
- **JSON Storage** - Clean, portable annotation format
- **Auto-Save** - Debounced saves (500ms delay)
- **No Build Process** - Single HTML file, maximum portability

---

## 🔐 Privacy & Data

Scripture Scribbles is **privacy-first**:

- ❌ No cloud storage
- ❌ No user accounts
- ❌ No tracking or analytics
- ❌ No data collection
- ✅ Everything stays on your device
- ✅ You control your data
- ✅ Works completely offline

---

## 🐛 Bug Reports

Found a bug? Please report it:

1. Click "Report a Bug" in the app footer
2. Describe the issue and steps to reproduce
3. Submit (uses Formspree for privacy)

Or open an issue on GitHub.

---

## 🤝 Contributing

Contributions are welcome! This is an open-source project built for the body of Christ.

**Ideas for contributions:**
- Custom styled modals (replace browser alerts)
- Cleanup tools (bulk delete annotations)
- Chapter/book notes support
- Export/import features
- Search and filter annotations
- Mobile app version
- Bible API integration

---

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details.

Free to use and modify. Please credit Scripture Scribbles if you fork or redistribute.

---

## 🙏 Credits

Built with ❤️ for the body of Christ.

- **Author:** Dave Wyborn
- **Website:** [scripturescribbles.co.uk](https://scripturescribbles.co.uk)
- **Feedback:** hello@scripturescribbles.co.uk

---

## 📋 Roadmap

### v1.1.0 (Next)
- Custom styled modals
- Cleanup tools
- Chapter/book notes
- Better error messages

### v2.0.0 (Future)
- Cloud sync (optional)
- Mobile app
- Bible API integration (NIV, ESV, etc.)
- Advanced search

---

## ⭐ Support

If Scripture Scribbles helps your Bible study:

- ⭐ Star this repo
- 🐦 Share with your community
- 🐛 Report bugs
- 💡 Suggest features
- 🙏 Pray for the project

---

**Made for the glory of God and the edification of His church.**
