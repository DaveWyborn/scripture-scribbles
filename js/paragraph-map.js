/**
 * Paragraph normalisation — overlay a consistent paragraph structure across
 * Bible versions whose source markup is poor.
 *
 * Versions vary wildly in how their source marks paragraphs (see
 * build_paragraph_map.py): ASV/KJV have one break per chapter (giant block),
 * AFV/BSB break on nearly every verse (individual verses), WEB is balanced.
 * For flagged versions we ignore their own break-points and reuse WEB's, keyed
 * by book name + verse number. Headings are left untouched (each version keeps
 * its own). Only affects fluid reading mode; verse-by-verse is unaffected.
 *
 * Toggle per version below. `true` = borrow WEB's structure; `false` = use the
 * version's own source structure. WEB is the reference, so it is never borrowed.
 */
const NORMALISE_PARAGRAPHS = {
    web: false, // reference — keep its own (good) structure
    bsb: true,  // breaks on nearly every verse → too granular
    asv: true,  // one break per chapter → giant block
    kjv: true,  // one break per chapter → giant block
    afv: true,  // synthetic break on every verse → individual verses
};

let paragraphMap = null;        // { reference, books: { [bookName]: { [chapter]: [verseNums] } } }
let _paragraphMapPromise = null;

function shouldNormaliseParagraphs(version) {
    return !!NORMALISE_PARAGRAPHS[(version || '').toLowerCase()];
}

/**
 * Load the WEB-derived paragraph map (small, ~8KB gz). Cached after first call.
 * Resolves to null on failure — callers fall back to the version's own structure.
 */
async function loadParagraphMap() {
    if (paragraphMap) return paragraphMap;
    if (_paragraphMapPromise) return _paragraphMapPromise;
    _paragraphMapPromise = (async () => {
        try {
            const res = await fetch('data/paragraph-map.json.gz');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
            const text = await new Response(stream).text();
            paragraphMap = JSON.parse(text);
            return paragraphMap;
        } catch (e) {
            console.warn('Paragraph map failed to load; using per-version structure:', e.message);
            return null;
        }
    })();
    return _paragraphMapPromise;
}

/**
 * Verse numbers that begin a new paragraph in the reference version for this
 * book/chapter. Returns a Set (empty if no map / no data).
 */
function getBorrowedParagraphStarts(bookName, chapterNum) {
    if (!paragraphMap || !paragraphMap.books) return new Set();
    const book = paragraphMap.books[bookName];
    if (!book) return new Set();
    return new Set(book[String(chapterNum)] || []);
}
