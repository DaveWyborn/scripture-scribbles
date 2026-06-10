// Tag screen - unified search + management for tags.
//
// One screen does both jobs: browse/search every tag, see all the verses
// carrying it *in context*, and rename / merge / recolour / delete from the
// same place. Context matters — you only spot "#Pete is the pastor, #Peter is
// the apostle" when you can see what each tag is actually attached to.
//
// Scope: spans ALL of the user's Bible versions and annotation sets, so this is
// a genuine "all my tags everywhere" view (per-verse tagging stays scoped to
// the version/set you're reading). Verse tags only for now; note tags follow.

let tagIndexRows = [];   // raw annotation rows cached for mutation
let tagIndex = {};       // { tagNameLower: { name, color, hits: [...] } }
let tagDetailName = null; // currently open tag in detail view, or null for list

// ---- Entry / exit -----------------------------------------------------------

async function openTagManager() {
    if (!currentUser) {
        alert('Please sign in to manage tags');
        return;
    }

    closeSettingsPanel();

    const modal = document.getElementById('tag-manager-modal');
    modal.classList.add('active');
    tagDetailName = null;
    document.getElementById('tag-manager-body').innerHTML =
        '<div class="tag-empty">Loading tags…</div>';

    await loadTagIndex();
    renderTagList();
}

function closeTagManager() {
    document.getElementById('tag-manager-modal').classList.remove('active');
    tagDetailName = null;
}

// ---- Data -------------------------------------------------------------------

// Fetch every annotation row for the user (all versions, all sets) and build a
// tag -> hits index. A hit is one verse carrying the tag.
async function loadTagIndex() {
    tagIndex = {};
    tagIndexRows = [];

    try {
        const { data, error } = await supabase
            .from('annotations')
            .select('*')
            .eq('user_id', currentUser.id);

        if (error) throw error;
        tagIndexRows = data || [];
    } catch (error) {
        console.error('Error loading tags:', error);
        document.getElementById('tag-manager-body').innerHTML =
            '<div class="tag-empty error">Could not load tags.</div>';
        return;
    }

    for (const row of tagIndexRows) {
        const { bookId, chapter } = splitBookId(row.book_id);
        const version = row.bible_version || 'WEB';
        const set = row.annotation_set || 'Study';
        const annotations = row.data || {};

        for (const [verseStr, ann] of Object.entries(annotations)) {
            if (!ann || !ann.tags) continue;
            for (const tag of ann.tags) {
                const name = (typeof tag === 'string' ? tag : tag.name);
                if (!name) continue;
                const key = name.toLowerCase();
                const color = (typeof tag === 'object' && tag.color)
                    ? tag.color
                    : (knownTags[key] || 'var(--accent-primary)');

                if (!tagIndex[key]) tagIndex[key] = { name: key, color, hits: [] };
                tagIndex[key].hits.push({
                    version, set, bookId, chapter,
                    verse: parseInt(verseStr, 10),
                    note: ann.note || ''
                });
            }
        }
    }

    // Fold in known tags that currently have zero verses, so they're still
    // visible to rename/delete.
    for (const [key, color] of Object.entries(knownTags)) {
        if (!tagIndex[key]) tagIndex[key] = { name: key, color, hits: [] };
    }
}

// book_id is "<bookId>-<chapter>"; chapter is always the final numeric segment,
// so split on the LAST hyphen (book ids may themselves contain hyphens).
function splitBookId(bookId) {
    const i = (bookId || '').lastIndexOf('-');
    if (i === -1) return { bookId: bookId, chapter: null };
    return {
        bookId: bookId.slice(0, i),
        chapter: parseInt(bookId.slice(i + 1), 10)
    };
}

function bookDisplayName(bookId) {
    if (typeof bibleData !== 'undefined' && bibleData && bibleData.books) {
        const b = bibleData.books.find(bk => bk.id === bookId);
        if (b) return b.name;
    }
    return bookId ? bookId.charAt(0).toUpperCase() + bookId.slice(1) : '?';
}

// ---- Master list view -------------------------------------------------------

// Render the list shell (search box + results container) once, then fill
// results. Typing updates only the results container — the search input stays
// in the DOM, so focus/caret/IME composition are never disturbed.
function renderTagList() {
    tagDetailName = null;
    const body = document.getElementById('tag-manager-body');

    if (Object.keys(tagIndex).length === 0) {
        body.innerHTML = '<div class="tag-empty">No tags yet. Tag a verse to get started.</div>';
        return;
    }

    body.innerHTML = `
        <div class="tag-search-row">
            <i class="ph ph-magnifying-glass"></i>
            <input type="search" id="tag-search-input" placeholder="Search tags…"
                   oninput="renderTagResults(this.value)" autocomplete="off">
        </div>
        <div id="tag-results"></div>`;
    renderTagResults('');
}

function renderTagResults(filter) {
    const wrap = document.getElementById('tag-results');
    if (!wrap) return;

    const q = (filter || '').trim().toLowerCase();
    const shown = Object.values(tagIndex)
        .filter(e => !q || e.name.includes(q))
        .sort((a, b) => a.name.localeCompare(b.name));

    if (shown.length === 0) {
        wrap.innerHTML = '<div class="tag-empty">No tags match "' + escapeHtml(q) + '".</div>';
        return;
    }

    let html = '<div class="tag-list">';
    for (const e of shown) {
        const n = e.hits.length;
        html += `
            <button class="tag-list-row" onclick="openTagDetail('${escapeAttr(e.name)}')">
                <span class="tag-dot" style="background:${e.color};"></span>
                <span class="tag-list-name">${escapeHtml(e.name)}</span>
                <span class="tag-list-count">${n} ${n === 1 ? 'verse' : 'verses'}</span>
                <i class="ph ph-caret-right"></i>
            </button>`;
    }
    html += '</div>';
    wrap.innerHTML = html;
}

// ---- Tag detail view --------------------------------------------------------

function openTagDetail(name) {
    tagDetailName = name;
    const entry = tagIndex[name];
    if (!entry) return renderTagList();
    const body = document.getElementById('tag-manager-body');

    // Group hits by version then by book, for a readable list.
    const hits = entry.hits.slice().sort(hitSort);

    let html = `
        <button class="tag-back" onclick="renderTagList()">
            <i class="ph ph-arrow-left"></i> All tags
        </button>
        <div class="tag-detail-head">
            <span class="tag-dot lg" style="background:${entry.color};"
                  title="Change colour" onclick="recolourTag('${escapeAttr(name)}')"></span>
            <input type="text" class="tag-detail-name" value="${escapeAttr(name)}"
                   onblur="renameTag('${escapeAttr(name)}', this.value)"
                   onkeydown="if(event.key==='Enter') this.blur()">
            <button class="tag-detail-delete" title="Delete tag"
                    onclick="deleteTagGlobal('${escapeAttr(name)}')">
                <i class="ph ph-trash"></i>
            </button>
        </div>
        <p class="tag-detail-hint">Rename to an existing tag to merge them. Tap a verse to open it.</p>`;

    if (hits.length === 0) {
        html += '<div class="tag-empty">No verses use this tag.</div>';
        body.innerHTML = html;
        return;
    }

    html += '<div class="tag-hits">';
    let lastGroup = null;
    for (const h of hits) {
        const group = `${h.version} · ${h.set}`;
        if (group !== lastGroup) {
            html += `<div class="tag-hit-group">${escapeHtml(group)}</div>`;
            lastGroup = group;
        }
        const ref = `${bookDisplayName(h.bookId)} ${h.chapter}:${h.verse}`;
        const note = h.note
            ? `<span class="tag-hit-note">${escapeHtml(h.note)}</span>` : '';
        html += `
            <button class="tag-hit" onclick="jumpToTagHit('${escapeAttr(h.version)}','${escapeAttr(h.bookId)}',${h.chapter},${h.verse})">
                <span class="tag-hit-ref">${escapeHtml(ref)}</span>
                ${note}
            </button>`;
    }
    html += '</div>';
    body.innerHTML = html;
}

function hitSort(a, b) {
    if (a.version !== b.version) return a.version.localeCompare(b.version);
    if (a.set !== b.set) return a.set.localeCompare(b.set);
    if (a.bookId !== b.bookId) return a.bookId.localeCompare(b.bookId);
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.verse - b.verse;
}

function jumpToTagHit(version, bookId, chapter, verse) {
    closeTagManager();
    if (typeof openClipTarget === 'function') {
        openClipTarget({ version, bookId, chapter, verse });
    }
}

// ---- Mutations (global across versions/sets) --------------------------------

// Walk every cached row, apply `fn(annotation, verseNum)` which mutates in
// place and returns true if it changed anything, then persist touched rows.
// Cleans up annotations left empty.
async function mutateTagRows(fn) {
    const dirty = [];
    for (const row of tagIndexRows) {
        let modified = false;
        const annotations = row.data || {};
        for (const verseNum of Object.keys(annotations)) {
            const ann = annotations[verseNum];
            if (!ann || !ann.tags) continue;
            if (fn(ann, verseNum)) modified = true;
            if (ann.tags && ann.tags.length === 0 &&
                !ann.highlight && !ann.underline && !ann.note) {
                delete annotations[verseNum];
            }
        }
        if (modified) {
            row.data = annotations;
            dirty.push(row);
        }
    }

    for (const row of dirty) {
        const { error } = await supabase
            .from('annotations')
            .update({ data: row.data })
            .eq('id', row.id);
        if (error) console.error('Tag update failed for row', row.id, error);
    }

    // Refresh the verse the user is currently reading, if any.
    if (typeof loadAnnotations === 'function') await loadAnnotations();
    if (typeof displayChapter === 'function') displayChapter();
}

function tagNameOf(tag) {
    return (typeof tag === 'string' ? tag : tag.name || '').toLowerCase();
}

async function recolourTag(name) {
    const colors = getTagColors();
    const picker = document.createElement('div');
    picker.className = 'inline-color-picker';
    let html = '<div class="picker-title">Tag colour</div><div class="picker-grid">';
    colors.forEach(c => {
        html += `<div class="picker-swatch" style="background:${c};" onclick="applyTagColour('${escapeAttr(name)}','${c}')"></div>`;
    });
    html += '</div><button class="btn" onclick="this.parentElement.remove()">Cancel</button>';
    picker.innerHTML = html;
    document.body.appendChild(picker);
}

async function applyTagColour(name, color) {
    document.querySelector('.inline-color-picker')?.remove();
    knownTags[name.toLowerCase()] = color;
    saveKnownTags();

    await mutateTagRows((ann) => {
        let changed = false;
        ann.tags = ann.tags.map(tag => {
            if (tagNameOf(tag) === name.toLowerCase()) {
                changed = true;
                return { name: (typeof tag === 'object' ? tag.name : tag), color };
            }
            return tag;
        });
        return changed;
    });

    await loadTagIndex();
    if (tagDetailName === name.toLowerCase()) openTagDetail(name.toLowerCase());
    else renderTagList();
}

// Rename — and merge when the new name already exists.
async function renameTag(oldName, rawNew) {
    const oldKey = oldName.toLowerCase();
    const newName = (rawNew || '').trim();
    const newKey = newName.toLowerCase();

    if (!newName || newKey === oldKey) {
        if (tagDetailName) openTagDetail(oldKey);
        return;
    }

    const targetExists = !!tagIndex[newKey] || !!knownTags[newKey];
    if (targetExists) {
        const n = tagIndex[oldKey] ? tagIndex[oldKey].hits.length : 0;
        if (!confirm(`#${newName} already exists.\n\nMerge #${oldName} (${n} ${n === 1 ? 'verse' : 'verses'}) into #${newName}? This can't be undone.`)) {
            if (tagDetailName) openTagDetail(oldKey);
            return;
        }
        await mergeTagInto(oldKey, newKey);
        return;
    }

    // Pure rename — keep the colour.
    const color = knownTags[oldKey] || (tagIndex[oldKey] && tagIndex[oldKey].color) || 'var(--accent-primary)';
    delete knownTags[oldKey];
    knownTags[newKey] = color;
    saveKnownTags();

    await mutateTagRows((ann) => {
        let changed = false;
        ann.tags = ann.tags.map(tag => {
            if (tagNameOf(tag) === oldKey) {
                changed = true;
                return { name: newName, color };
            }
            return tag;
        });
        return changed;
    });

    await loadTagIndex();
    openTagDetail(newKey);
}

// Fold every use of `sourceKey` into `targetKey`, de-duplicating where a verse
// already carries the target.
async function mergeTagInto(sourceKey, targetKey) {
    const targetColor = knownTags[targetKey] || (tagIndex[targetKey] && tagIndex[targetKey].color) || 'var(--accent-primary)';

    await mutateTagRows((ann) => {
        const hasSource = ann.tags.some(t => tagNameOf(t) === sourceKey);
        if (!hasSource) return false;
        const hasTarget = ann.tags.some(t => tagNameOf(t) === targetKey);
        // Drop the source tag.
        ann.tags = ann.tags.filter(t => tagNameOf(t) !== sourceKey);
        // Add target if it wasn't already there.
        if (!hasTarget) ann.tags.push({ name: targetKey, color: targetColor });
        return true;
    });

    delete knownTags[sourceKey];
    saveKnownTags();

    await loadTagIndex();
    openTagDetail(targetKey);
}

async function deleteTagGlobal(name) {
    const key = name.toLowerCase();
    const n = tagIndex[key] ? tagIndex[key].hits.length : 0;
    if (!confirm(`Delete #${name}?\n\nRemoves it from ${n} ${n === 1 ? 'verse' : 'verses'} across all versions. Highlights and notes are kept.`)) {
        return;
    }

    delete knownTags[key];
    saveKnownTags();

    await mutateTagRows((ann) => {
        const before = ann.tags.length;
        ann.tags = ann.tags.filter(t => tagNameOf(t) !== key);
        return ann.tags.length !== before;
    });

    await loadTagIndex();
    renderTagList();
}

// ---- Small helpers ----------------------------------------------------------

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}
function escapeAttr(s) {
    return escapeHtml(s).replace(/`/g, '&#96;');
}
