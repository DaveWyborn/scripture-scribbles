// Tag Manager Module - Edit and manage tags

// Open tag manager modal
function openTagManager() {
    if (!currentUser) {
        alert('Please sign in to manage tags');
        return;
    }

    // Close settings menu
    document.getElementById('settings-menu').classList.remove('open');

    // Populate tag list
    populateTagManager();

    // Show modal
    document.getElementById('tag-manager-modal').classList.add('active');
}

// Close tag manager modal
function closeTagManager() {
    document.getElementById('tag-manager-modal').classList.remove('active');
}

// Populate tag list
function populateTagManager() {
    const list = document.getElementById('tag-manager-list');

    if (Object.keys(knownTags).length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-tertiary);">No tags yet. Create a tag by adding it to a verse.</div>';
        return;
    }

    // Count usage of each tag
    const tagUsage = {};
    Object.values(allAnnotations).forEach(bookAnnotations => {
        Object.values(bookAnnotations).forEach(chapterAnnotations => {
            Object.values(chapterAnnotations).forEach(annotation => {
                if (annotation.tags) {
                    annotation.tags.forEach(tag => {
                        const tagName = (typeof tag === 'string' ? tag : tag.name).toLowerCase();
                        tagUsage[tagName] = (tagUsage[tagName] || 0) + 1;
                    });
                }
            });
        });
    });

    // Build tag list HTML
    let html = '';
    Object.entries(knownTags).sort((a, b) => a[0].localeCompare(b[0])).forEach(([name, color]) => {
        const count = tagUsage[name] || 0;
        html += `
            <div class="tag-manager-item" data-tag="${name}">
                <div class="tag-manager-color" style="background: ${color};" onclick="editTagColor('${name}')"></div>
                <input type="text" class="tag-manager-name" value="${name}" onblur="saveTagName('${name}', this.value)" onkeydown="if(event.key==='Enter') this.blur()">
                <span class="tag-manager-count">${count} ${count === 1 ? 'verse' : 'verses'}</span>
                <button class="tag-manager-delete" onclick="deleteTag('${name}')" title="Delete tag">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        `;
    });

    list.innerHTML = html;
}

// Edit tag color
async function editTagColor(oldName) {
    const colors = getTagColors();

    // Create a simple color picker popup
    const colorPicker = document.createElement('div');
    colorPicker.className = 'inline-color-picker';
    colorPicker.style.position = 'fixed';
    colorPicker.style.top = '50%';
    colorPicker.style.left = '50%';
    colorPicker.style.transform = 'translate(-50%, -50%)';
    colorPicker.style.background = 'var(--bg-primary)';
    colorPicker.style.border = '2px solid var(--border)';
    colorPicker.style.borderRadius = '12px';
    colorPicker.style.padding = '20px';
    colorPicker.style.zIndex = '10001';
    colorPicker.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';

    let html = '<div style="font-weight: bold; margin-bottom: 15px;">Select new color</div>';
    html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">';
    colors.forEach(color => {
        html += `<div style="width: 40px; height: 40px; background: ${color}; border-radius: 8px; cursor: pointer; border: 2px solid var(--border);" onclick="applyTagColor('${oldName}', '${color}')"></div>`;
    });
    html += '</div>';
    html += '<button class="btn" style="margin-top: 15px; width: 100%;" onclick="this.parentElement.remove()">Cancel</button>';

    colorPicker.innerHTML = html;
    document.body.appendChild(colorPicker);
}

// Apply new color to tag
async function applyTagColor(oldName, newColor) {
    // Update knownTags
    knownTags[oldName.toLowerCase()] = newColor;
    saveKnownTags();

    // Update all annotations with this tag
    let updated = false;
    Object.keys(allAnnotations).forEach(book => {
        Object.keys(allAnnotations[book]).forEach(chapter => {
            Object.keys(allAnnotations[book][chapter]).forEach(verse => {
                const annotation = allAnnotations[book][chapter][verse];
                if (annotation.tags) {
                    annotation.tags.forEach(tag => {
                        if (typeof tag === 'object' && tag.name.toLowerCase() === oldName.toLowerCase()) {
                            tag.color = newColor;
                            updated = true;
                        }
                    });
                }
            });
        });
    });

    if (updated) {
        // Save to Supabase
        await syncAnnotations();
    }

    // Refresh display
    displayChapter();
    populateTagManager();

    // Remove color picker
    document.querySelector('.inline-color-picker')?.remove();
}

// Save tag name change
async function saveTagName(oldName, newName) {
    newName = newName.trim();

    // Validation
    if (!newName) {
        alert('Tag name cannot be empty');
        populateTagManager();
        return;
    }

    if (newName.toLowerCase() === oldName.toLowerCase()) {
        return; // No change
    }

    if (knownTags[newName.toLowerCase()]) {
        alert('A tag with this name already exists');
        populateTagManager();
        return;
    }

    // Update knownTags
    const color = knownTags[oldName.toLowerCase()];
    delete knownTags[oldName.toLowerCase()];
    knownTags[newName.toLowerCase()] = color;
    saveKnownTags();

    // Update all annotations with this tag
    let updated = false;
    Object.keys(allAnnotations).forEach(book => {
        Object.keys(allAnnotations[book]).forEach(chapter => {
            Object.keys(allAnnotations[book][chapter]).forEach(verse => {
                const annotation = allAnnotations[book][chapter][verse];
                if (annotation.tags) {
                    annotation.tags.forEach(tag => {
                        if (typeof tag === 'string' && tag.toLowerCase() === oldName.toLowerCase()) {
                            // Update string tag
                            const idx = annotation.tags.indexOf(tag);
                            annotation.tags[idx] = { name: newName, color: color };
                            updated = true;
                        } else if (typeof tag === 'object' && tag.name.toLowerCase() === oldName.toLowerCase()) {
                            // Update object tag
                            tag.name = newName;
                            updated = true;
                        }
                    });
                }
            });
        });
    });

    if (updated) {
        // Save to Supabase
        await syncAnnotations();
    }

    // Refresh display
    displayChapter();
    populateTagManager();
}

// Delete tag
async function deleteTag(tagName) {
    const count = document.querySelector(`[data-tag="${tagName}"] .tag-manager-count`).textContent;

    if (!confirm(`Delete tag "${tagName}"?\n\nThis will remove it from ${count} but keep the verses' highlights and notes.`)) {
        return;
    }

    // Remove from knownTags
    delete knownTags[tagName.toLowerCase()];
    saveKnownTags();

    // Remove from all annotations
    let updated = false;
    Object.keys(allAnnotations).forEach(book => {
        Object.keys(allAnnotations[book]).forEach(chapter => {
            Object.keys(allAnnotations[book][chapter]).forEach(verse => {
                const annotation = allAnnotations[book][chapter][verse];
                if (annotation.tags) {
                    const originalLength = annotation.tags.length;
                    annotation.tags = annotation.tags.filter(tag => {
                        const name = (typeof tag === 'string' ? tag : tag.name).toLowerCase();
                        return name !== tagName.toLowerCase();
                    });

                    if (annotation.tags.length !== originalLength) {
                        updated = true;
                    }

                    // Clean up empty annotation
                    if (annotation.tags.length === 0 &&
                        !annotation.highlight &&
                        !annotation.underline &&
                        !annotation.note) {
                        delete allAnnotations[book][chapter][verse];
                    }
                }
            });
        });
    });

    if (updated) {
        // Save to Supabase
        await syncAnnotations();
    }

    // Refresh display
    displayChapter();
    populateTagManager();
}
