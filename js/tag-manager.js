// Tag Manager Module - Edit and manage tags

// Open tag manager modal
async function openTagManager() {
    if (!currentUser) {
        alert('Please sign in to manage tags');
        return;
    }

    // Close settings menu
    document.getElementById('settings-menu').classList.remove('open');

    // Show modal with loading state
    const modal = document.getElementById('tag-manager-modal');
    modal.classList.add('active');
    document.getElementById('tag-manager-list').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-tertiary);">Loading tags...</div>';

    // Populate tag list
    await populateTagManager();
}

// Close tag manager modal
function closeTagManager() {
    document.getElementById('tag-manager-modal').classList.remove('active');
}

// Populate tag list
async function populateTagManager() {
    const list = document.getElementById('tag-manager-list');

    if (Object.keys(knownTags).length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-tertiary);">No tags yet. Create a tag by adding it to a verse.</div>';
        return;
    }

    // Count usage of each tag by querying Supabase
    const tagUsage = {};

    try {
        const { data, error } = await supabase
            .from('annotations')
            .select('data')
            .eq('user_id', currentUser.id)
            .eq('bible_version', 'WEB')
            .eq('annotation_set', currentAnnotationSet);

        if (error) throw error;

        // Count tag usage
        data.forEach(row => {
            Object.values(row.data || {}).forEach(annotation => {
                if (annotation.tags) {
                    annotation.tags.forEach(tag => {
                        const tagName = (typeof tag === 'string' ? tag : tag.name).toLowerCase();
                        tagUsage[tagName] = (tagUsage[tagName] || 0) + 1;
                    });
                }
            });
        });
    } catch (error) {
        console.error('Error loading tag usage:', error);
        list.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--accent-negative);">Error loading tags</div>';
        return;
    }

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

    // Update all annotations with this tag in Supabase
    try {
        const { data: rows, error } = await supabase
            .from('annotations')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('bible_version', 'WEB')
            .eq('annotation_set', currentAnnotationSet);

        if (error) throw error;

        // Update tags in each row
        for (const row of rows) {
            let modified = false;
            const annotations = row.data || {};

            Object.values(annotations).forEach(annotation => {
                if (annotation.tags) {
                    annotation.tags.forEach(tag => {
                        if (typeof tag === 'object' && tag.name.toLowerCase() === oldName.toLowerCase()) {
                            tag.color = newColor;
                            modified = true;
                        }
                    });
                }
            });

            if (modified) {
                await supabase
                    .from('annotations')
                    .update({ data: annotations })
                    .eq('id', row.id);
            }
        }

        // Refresh current chapter and display
        await loadAnnotations(currentBook, currentChapter);
        displayChapter();
        await populateTagManager();

    } catch (error) {
        console.error('Error updating tag color:', error);
        alert('Failed to update tag color');
    }

    // Remove color picker
    document.querySelector('.inline-color-picker')?.remove();
}

// Save tag name change
async function saveTagName(oldName, newName) {
    newName = newName.trim();

    // Validation
    if (!newName) {
        alert('Tag name cannot be empty');
        await populateTagManager();
        return;
    }

    if (newName.toLowerCase() === oldName.toLowerCase()) {
        return; // No change
    }

    if (knownTags[newName.toLowerCase()]) {
        alert('A tag with this name already exists');
        await populateTagManager();
        return;
    }

    // Update knownTags
    const color = knownTags[oldName.toLowerCase()];
    delete knownTags[oldName.toLowerCase()];
    knownTags[newName.toLowerCase()] = color;
    saveKnownTags();

    // Update all annotations with this tag in Supabase
    try {
        const { data: rows, error } = await supabase
            .from('annotations')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('bible_version', 'WEB')
            .eq('annotation_set', currentAnnotationSet);

        if (error) throw error;

        // Update tags in each row
        for (const row of rows) {
            let modified = false;
            const annotations = row.data || {};

            Object.values(annotations).forEach(annotation => {
                if (annotation.tags) {
                    annotation.tags.forEach(tag => {
                        if (typeof tag === 'string' && tag.toLowerCase() === oldName.toLowerCase()) {
                            // Update string tag
                            const idx = annotation.tags.indexOf(tag);
                            annotation.tags[idx] = { name: newName, color: color };
                            modified = true;
                        } else if (typeof tag === 'object' && tag.name.toLowerCase() === oldName.toLowerCase()) {
                            // Update object tag
                            tag.name = newName;
                            modified = true;
                        }
                    });
                }
            });

            if (modified) {
                await supabase
                    .from('annotations')
                    .update({ data: annotations })
                    .eq('id', row.id);
            }
        }

        // Refresh current chapter and display
        await loadAnnotations(currentBook, currentChapter);
        displayChapter();
        await populateTagManager();

    } catch (error) {
        console.error('Error updating tag name:', error);
        alert('Failed to update tag name');
    }
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

    // Remove from all annotations in Supabase
    try {
        const { data: rows, error } = await supabase
            .from('annotations')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('bible_version', 'WEB')
            .eq('annotation_set', currentAnnotationSet);

        if (error) throw error;

        // Remove tag from each row
        for (const row of rows) {
            let modified = false;
            const annotations = row.data || {};

            Object.keys(annotations).forEach(verseNum => {
                const annotation = annotations[verseNum];
                if (annotation.tags) {
                    const originalLength = annotation.tags.length;
                    annotation.tags = annotation.tags.filter(tag => {
                        const name = (typeof tag === 'string' ? tag : tag.name).toLowerCase();
                        return name !== tagName.toLowerCase();
                    });

                    if (annotation.tags.length !== originalLength) {
                        modified = true;
                    }

                    // Clean up empty annotation
                    if (annotation.tags.length === 0 &&
                        !annotation.highlight &&
                        !annotation.underline &&
                        !annotation.note) {
                        delete annotations[verseNum];
                    }
                }
            });

            if (modified) {
                await supabase
                    .from('annotations')
                    .update({ data: annotations })
                    .eq('id', row.id);
            }
        }

        // Refresh current chapter and display
        await loadAnnotations(currentBook, currentChapter);
        displayChapter();
        await populateTagManager();

    } catch (error) {
        console.error('Error deleting tag:', error);
        alert('Failed to delete tag');
    }
}
