# Scripture Scribbles - Deployment Guide

## 🚀 Going Live Tonight!

### Files to Deploy

1. **index.html** - Landing page
2. **scripture-scribbles-reader.html** - Main application

### Option 1: GitHub Pages (Recommended - Free & Easy)

**Steps:**
1. Create a new GitHub repository:
   - Go to github.com
   - Click "New repository"
   - Name: `scripture-scribbles`
   - Public repository
   - Click "Create repository"

2. Upload files:
   ```bash
   cd /Users/davewyborn/Documents/2_Obsidian
   git init
   git add index.html scripture-scribbles-reader.html
   git commit -m "Initial release v1.0.0"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/scripture-scribbles.git
   git push -u origin main
   ```

3. Enable GitHub Pages:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: "Deploy from a branch"
   - Branch: `main` / `root`
   - Click "Save"

4. Wait 1-2 minutes, then visit:
   - `https://YOUR_USERNAME.github.io/scripture-scribbles`

### Option 2: Netlify (Alternative - Drag & Drop)

1. Go to netlify.com
2. Sign up (free)
3. Drag & drop both files
4. Site will be live at: `https://random-name.netlify.app`
5. Change site name in settings

### Custom Domain Setup (scripturescribbles.co.uk)

**For GitHub Pages:**
1. In your repo settings → Pages
2. Custom domain: `scripturescribbles.co.uk`
3. In your domain registrar (e.g., Namecheap, GoDaddy):
   - Add CNAME record: `www` → `YOUR_USERNAME.github.io`
   - Add A records for apex domain:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```

**For Netlify:**
1. Site settings → Domain management
2. Add custom domain: `scripturescribbles.co.uk`
3. Follow Netlify's DNS instructions

### Bug Report Setup (Formspree)

1. Go to formspree.io
2. Sign up (free for 50 submissions/month)
3. Create new form
4. Copy your form ID (e.g., `mqazwxyz`)
5. Update `scripture-scribbles-reader.html` line 2692:
   ```javascript
   const response = await fetch('https://formspree.io/f/mqazwxyz', {
   ```

**Alternative:** Use your personal email for now:
```javascript
// Line 2692 - Change to:
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
```

Or set up email forwarding:
- `bugs@scripturescribbles.co.uk` → your personal email

### Pre-Launch Checklist

- [ ] Test landing page loads correctly
- [ ] Test app launches from landing page
- [ ] Test welcome modal appears on first visit
- [ ] Test folder selection works
- [ ] Test highlighting and auto-save
- [ ] Test bug report form (submit test bug)
- [ ] Verify all links work
- [ ] Test on mobile (will show browser warning - expected)
- [ ] Test in Chrome, Edge, Brave
- [ ] Clear localStorage and test as new user

### Launch Announcement Template

**For Obsidian Community:**

```markdown
# Scripture Scribbles - Bible Study Tool (Works with Obsidian!)

I've just launched Scripture Scribbles - a local-first Bible study tool that works perfectly with Bible markdown files!

🎨 Features:
- Highlight verses (6 colours)
- Add detailed notes
- Tag verses
- Multiple annotation sets (Study, Church, Personal, etc.)
- Auto-save
- 100% local & private

💡 Perfect for Obsidian users:
- Use your existing Bible markdown files
- Files stay untouched - annotations saved separately in JSON
- Keep using Obsidian for everything else!

🔗 Try it: https://scripturescribbles.co.uk

Works in Chrome, Edge, or Brave. Completely free and open source.

Questions? Feedback? Let me know!
```

### Post-Launch Monitoring

**First 24 hours:**
- Check GitHub/Netlify analytics
- Monitor bug reports
- Watch for issues in console (if users report problems)
- Be ready to hotfix if needed

**First week:**
- Gather feedback from Obsidian community
- Note feature requests
- Fix critical bugs
- Plan v1.1.0

### Version History

**v1.0.0 (Launch):**
- Auto-save annotations
- 6-colour highlighting
- Notes and tags
- Multiple annotation sets
- Welcome modal for first-time users
- Bug report system
- Obsidian-compatible

### Future Versions

**v1.1.0 (Planned):**
- Custom styled modals (replace browser alerts)
- Cleanup tools
- Chapter/book notes
- Better error messages

**v2.0.0 (Future):**
- Cloud sync (optional)
- Mobile app
- Bible API integration (NIV, ESV, etc.)

---

## 🎉 You're Ready to Launch!

1. Push to GitHub/Netlify
2. Set up custom domain
3. Test everything
4. Announce to Obsidian community
5. Monitor and iterate

Good luck! 🚀
