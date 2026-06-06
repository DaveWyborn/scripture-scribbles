// Note headings — add H2/H3 levels to the Trix note editor.
//
// Trix ships with a single heading level (heading1 → <h1>). Sermon notes need
// section structure, so we register two more levels and surface H1/H2/H3 as
// text buttons in the toolbar. Must run before any trix-editor initialises;
// it's an IIFE at load time and editors are only mounted on demand.
(function () {
    if (typeof Trix === 'undefined') return;

    // Register the extra heading levels (mirrors Trix's built-in heading1).
    Trix.config.blockAttributes.heading2 = {
        tagName: 'h2', terminal: true, breakOnReturn: true, group: false
    };
    Trix.config.blockAttributes.heading3 = {
        tagName: 'h3', terminal: true, breakOnReturn: true, group: false
    };

    // Replace the default icon heading button with three text buttons (H1/H2/H3)
    // baked into the toolbar HTML, so Trix wires their click + active state
    // natively (buttons added after init don't get active-state updates).
    const origGetDefaultHTML = Trix.config.toolbar.getDefaultHTML;
    Trix.config.toolbar.getDefaultHTML = function () {
        const html = origGetDefaultHTML.apply(this, arguments);
        const btn = (attr, label, title) =>
            `<button type="button" class="trix-button trix-button--heading" ` +
            `data-trix-attribute="${attr}" title="${title}" tabindex="-1">${label}</button>`;
        const replacement =
            btn('heading1', 'H1', 'Heading 1') +
            btn('heading2', 'H2', 'Heading 2') +
            btn('heading3', 'H3', 'Heading 3');
        // Swap the single built-in heading1 button for our three.
        return html.replace(
            /<button[^>]*data-trix-attribute="heading1"[^>]*>[^<]*<\/button>/,
            replacement
        );
    };
})();
