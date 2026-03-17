# Decision Log

---

## 2024-11-20 Hybrid free/premium Bible version model

**Decision:** Free tier bundles public domain Bibles locally (WEB, ASV, KJV). Premium tier accesses licensed translations (NIV, ESV, NASB) via API with a 500-verse rolling cache, falling back to WEB when uncached.

**Rationale:** Can't negotiate YouVersion-style bulk licensing without scale. API.Bible provides access to licensed translations without upfront licensing fees. The 500-verse cache stays within API licence terms. WEB fallback solves the sermon use case (preacher jumps to an uncached passage — instantly falls back rather than showing a loading spinner).

**Consequences:** Premium users get modern translations but are API-dependent; offline use limited to the cache. Charity registration (v2.0.0) may enable better direct licensing terms later.

---

## 2024-11-20 USFM → Enhanced JSON conversion (not runtime parsing)

**Decision:** Convert public domain Bibles from USFM source format to a custom enhanced JSON schema offline, then bundle the JSON.

**Rationale:** USFM is the industry-standard source format but expensive to parse at runtime. Converting once gives instant loading, enables paragraph and heading data (critical for fluid reading mode), and removes a runtime dependency. Analogous to compiling source code.

**Consequences:** One-time converter script required (Node.js). JSON files are larger than raw USFM but load faster. Any USFM source updates require re-conversion.

---

## 2024-11-20 Anti-YouVersion simplicity as core design strategy

**Decision:** Deliberately minimal UI. Features off by default. No feature parity with YouVersion. Optimise for beautiful reading, not feature count.

**Rationale:** YouVersion has 16+ menu items and buries key settings. This is a weakness. The target user (dyslexic reader) benefits most from reduced cognitive load. "Clean UI that stays out of the way" is a genuine differentiator, not a limitation.

**Consequences:** Feature requests should be evaluated against this principle. Anything that adds visible UI complexity by default is suspect. Optional features must be truly opt-in (when off, remove from UI entirely).

---

## 2024-11-20 Prove concept before paid features (1,000-user gate)

**Decision:** Do not build paid features (v1.6.0+) until 1,000 users achieved with v1.2.0–v1.3.0.

**Rationale:** Avoids building a monetisation system for an unvalidated product. If 1,000 users can't be reached with a beautiful free experience, a paid tier won't fix it. Forces focus on core reading quality first.

**Consequences:** Stripe integration, API-licensed Bibles, and audio reader are all deferred. Revenue is zero until validation. If 1,000 users not reached, full strategy re-evaluation triggered.

---

## 2024-11-20 Reading bar as killer differentiator feature

**Decision:** Build a digital reading bar (focus aid) modelled on the physical ruler dyslexic readers use with printed books. Target v1.3.0.

**Rationale:** No other digital Bible app has this. Directly addresses a documented dyslexic reading strategy. Combined with spacing controls, it creates genuine innovation rather than feature parity. Research shows dyslexic readers benefit significantly from focus aids.

**Consequences:** Requires non-trivial UI engineering (scroll tracking, multiple visual modes, keyboard + touch controls). High value if it lands well; high risk if it's fiddly on mobile.

---

## 2024-11-20 Vanilla JS + single HTML file architecture

**Decision:** No framework, no build pipeline. Each version is a self-contained HTML file. Deployed via GitHub Pages.

**Rationale:** Solo developer. Zero build complexity. Instant deploy. Easy to version (just a new HTML file). No dependency management. GitHub Pages handles hosting for free.

**Consequences:** Files grow large as features accumulate (v1.3 is 26KB, v1.2 was 104KB — discrepancy suggests refactoring happened). No tree-shaking or code splitting. All features load together. Harder to maintain as complexity grows; may need revisiting at v2.0.

---

## 2024-11-20 Supabase for auth and cloud sync

**Decision:** Use Supabase (PostgreSQL + Auth + Storage) for user authentication and annotation cloud sync. IndexedDB for local storage.

**Rationale:** Simpler than building custom auth. Row Level Security (RLS) handles data isolation cleanly. PostgreSQL is familiar. Open-source and transparent (aligns with project values). Google OAuth + email/password covers the main use cases.

**Consequences:** Hard dependency on Supabase. If Supabase pricing changes at scale, migration is significant. RLS must be set up correctly or data isolation fails — see `SUPABASE-SETUP-GUIDE.md`.

---

## 2024-11-20 Charity transition model at 10,000 users

**Decision:** At 10,000 users, register as a UK Charitable Incorporated Organisation (CIO). Partner with Wycliffe Bible Translators (40% of revenue). This is v2.0.0.

**Rationale:** Mission alignment — funding Bible translation is consistent with making Bible accessible. Charity status enables better publisher licensing terms (similar to how YouVersion gets preferential deals). Gift Aid adds 25% to UK donations. Grant funding becomes available.

**Consequences:** Requires recruiting 2–3 trustees. Charity registration takes 3–6 months. Revenue allocation becomes public (40% Wycliffe, 20% ops, 25% dev, 10% marketing, 5% reserves). Founder can be employed by the charity with trustee approval.

---

## 2025-12-17 Trix for sermon notes rich text editor

**Decision:** Use Trix (Basecamp's open-source rich text editor) for the sermon/message notes feature in v1.4.0.

**Rationale:** Trix is lightweight, dependency-free, produces clean HTML, and integrates well with vanilla JS. Avoided heavier options (Quill, ProseMirror, TipTap) given the no-framework constraint.

**Consequences:** Trix initialisation has proven tricky — particularly on mobile and when the editor element is hidden on load (multiple fixes committed Feb 2026). Must ensure the editor DOM element is visible before initialising, or defer init until first render.
