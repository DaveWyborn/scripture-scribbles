#!/usr/bin/env node

/**
 * USFM to Enhanced JSON Converter
 *
 * Converts USFM Bible files to enhanced JSON format with:
 * - Paragraphs, headings, poetry
 * - Footnotes and cross-references (preserved but not displayed yet)
 * - Clean text without Strong's numbers
 *
 * Usage: node usfm-converter.js <input-dir> <output-file>
 */

const fs = require('fs');
const path = require('path');

// Book mapping (USFM code -> book info)
const BOOK_MAP = {
  'GEN': { number: 1, name: 'Genesis', testament: 'OT' },
  'EXO': { number: 2, name: 'Exodus', testament: 'OT' },
  'LEV': { number: 3, name: 'Leviticus', testament: 'OT' },
  'NUM': { number: 4, name: 'Numbers', testament: 'OT' },
  'DEU': { number: 5, name: 'Deuteronomy', testament: 'OT' },
  'JOS': { number: 6, name: 'Joshua', testament: 'OT' },
  'JDG': { number: 7, name: 'Judges', testament: 'OT' },
  'RUT': { number: 8, name: 'Ruth', testament: 'OT' },
  '1SA': { number: 9, name: '1 Samuel', testament: 'OT' },
  '2SA': { number: 10, name: '2 Samuel', testament: 'OT' },
  '1KI': { number: 11, name: '1 Kings', testament: 'OT' },
  '2KI': { number: 12, name: '2 Kings', testament: 'OT' },
  '1CH': { number: 13, name: '1 Chronicles', testament: 'OT' },
  '2CH': { number: 14, name: '2 Chronicles', testament: 'OT' },
  'EZR': { number: 15, name: 'Ezra', testament: 'OT' },
  'NEH': { number: 16, name: 'Nehemiah', testament: 'OT' },
  'EST': { number: 17, name: 'Esther', testament: 'OT' },
  'JOB': { number: 18, name: 'Job', testament: 'OT' },
  'PSA': { number: 19, name: 'Psalms', testament: 'OT' },
  'PRO': { number: 20, name: 'Proverbs', testament: 'OT' },
  'ECC': { number: 21, name: 'Ecclesiastes', testament: 'OT' },
  'SNG': { number: 22, name: 'Song of Solomon', testament: 'OT' },
  'ISA': { number: 23, name: 'Isaiah', testament: 'OT' },
  'JER': { number: 24, name: 'Jeremiah', testament: 'OT' },
  'LAM': { number: 25, name: 'Lamentations', testament: 'OT' },
  'EZK': { number: 26, name: 'Ezekiel', testament: 'OT' },
  'DAN': { number: 27, name: 'Daniel', testament: 'OT' },
  'HOS': { number: 28, name: 'Hosea', testament: 'OT' },
  'JOL': { number: 29, name: 'Joel', testament: 'OT' },
  'AMO': { number: 30, name: 'Amos', testament: 'OT' },
  'OBA': { number: 31, name: 'Obadiah', testament: 'OT' },
  'JON': { number: 32, name: 'Jonah', testament: 'OT' },
  'MIC': { number: 33, name: 'Micah', testament: 'OT' },
  'NAM': { number: 34, name: 'Nahum', testament: 'OT' },
  'HAB': { number: 35, name: 'Habakkuk', testament: 'OT' },
  'ZEP': { number: 36, name: 'Zephaniah', testament: 'OT' },
  'HAG': { number: 37, name: 'Haggai', testament: 'OT' },
  'ZEC': { number: 38, name: 'Zechariah', testament: 'OT' },
  'MAL': { number: 39, name: 'Malachi', testament: 'OT' },
  'MAT': { number: 40, name: 'Matthew', testament: 'NT' },
  'MRK': { number: 41, name: 'Mark', testament: 'NT' },
  'LUK': { number: 42, name: 'Luke', testament: 'NT' },
  'JHN': { number: 43, name: 'John', testament: 'NT' },
  'ACT': { number: 44, name: 'Acts', testament: 'NT' },
  'ROM': { number: 45, name: 'Romans', testament: 'NT' },
  '1CO': { number: 46, name: '1 Corinthians', testament: 'NT' },
  '2CO': { number: 47, name: '2 Corinthians', testament: 'NT' },
  'GAL': { number: 48, name: 'Galatians', testament: 'NT' },
  'EPH': { number: 49, name: 'Ephesians', testament: 'NT' },
  'PHP': { number: 50, name: 'Philippians', testament: 'NT' },
  'COL': { number: 51, name: 'Colossians', testament: 'NT' },
  '1TH': { number: 52, name: '1 Thessalonians', testament: 'NT' },
  '2TH': { number: 53, name: '2 Thessalonians', testament: 'NT' },
  '1TI': { number: 54, name: '1 Timothy', testament: 'NT' },
  '2TI': { number: 55, name: '2 Timothy', testament: 'NT' },
  'TIT': { number: 56, name: 'Titus', testament: 'NT' },
  'PHM': { number: 57, name: 'Philemon', testament: 'NT' },
  'HEB': { number: 58, name: 'Hebrews', testament: 'NT' },
  'JAS': { number: 59, name: 'James', testament: 'NT' },
  '1PE': { number: 60, name: '1 Peter', testament: 'NT' },
  '2PE': { number: 61, name: '2 Peter', testament: 'NT' },
  '1JN': { number: 62, name: '1 John', testament: 'NT' },
  '2JN': { number: 63, name: '2 John', testament: 'NT' },
  '3JN': { number: 64, name: '3 John', testament: 'NT' },
  'JUD': { number: 65, name: 'Jude', testament: 'NT' },
  'REV': { number: 66, name: 'Revelation', testament: 'NT' }
};

/**
 * Clean text by removing USFM markers but preserving text
 */
function cleanText(text) {
  // Remove Strong's word markers: \w text|strong="..."\w*
  text = text.replace(/\\w\s+(.*?)(?:\|strong=".*?")?\\w\*/g, '$1');

  // Remove +w markers (used for emphasis/Jesus words) but keep text
  text = text.replace(/\\\+w\s+(.*?)(?:\|strong=".*?")?\\\+w\*/g, '$1');

  // Remove +wh markers (Hebrew words in footnotes) but keep text
  text = text.replace(/\\\+wh\s+(.*?)\\\+wh\*/g, '$1');

  // Remove words of Jesus markers — close (\wj*) BEFORE open (\wj) so the
  // open-marker regex doesn't eat \wj from \wj* and leave a stray asterisk.
  text = text.replace(/\\wj\*/g, '');
  text = text.replace(/\\wj\s*/g, '');

  // Remove keyword markers, keeping the inner text
  text = text.replace(/\\k\s+(.*?)\\k\*/g, '$1');

  // Strip any other stray markers that snuck through (e.g. \b stanza break,
  // unhandled paragraph variants). Match optional \d? for levels and \*? for close.
  text = text.replace(/\\[a-z]+\d?\*?(?=\s|$)/g, '');

  // Clean up extra spaces
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Extract Strong's numbers from text as structured word data
 * Returns array of { text, strong } objects
 */
function extractWords(text) {
  // First remove Jesus words markers to avoid them interfering
  let cleanedText = text.replace(/\\wj\s*/g, '').replace(/\\wj\*/g, '');

  // Also remove footnotes and cross-refs from word extraction
  cleanedText = cleanedText.replace(/\\f\s+\+\s+.*?\\f\*/gs, '');
  cleanedText = cleanedText.replace(/\\x\s+\+\s+.*?\\x\*/gs, '');

  const words = [];
  const regex = /\\\+?w\s+(.*?)(?:\|strong="(.*?)")?\\\+?w\*/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(cleanedText)) !== null) {
    // Add any non-tagged text before this match
    if (match.index > lastIndex) {
      const plainText = cleanedText.substring(lastIndex, match.index).trim();
      if (plainText && plainText !== '\\wj' && plainText !== '\\wj*') {
        // Filter out any stray markers
        words.push({ text: plainText });
      }
    }

    // Add the tagged word
    const wordText = match[1].trim();
    if (wordText) {
      const word = { text: wordText };
      if (match[2]) {
        word.strong = match[2]; // e.g., "G2316" or "H3068"
      }
      words.push(word);
    }

    lastIndex = regex.lastIndex;
  }

  // Add any remaining text
  if (lastIndex < cleanedText.length) {
    const plainText = cleanedText.substring(lastIndex).trim();
    if (plainText && plainText !== '\\wj' && plainText !== '\\wj*') {
      words.push({ text: plainText });
    }
  }

  return words.length > 0 ? words : null;
}

/**
 * Extract footnotes from text
 * Format: \f + \fr 1:1 \ft Explanation text\f*
 */
function extractFootnotes(text) {
  const footnotes = [];
  const regex = /\\f\s+\+\s+(.*?)\\f\*/gs; // Added 's' flag for multiline

  let match;

  while ((match = regex.exec(text)) !== null) {
    const content = match[1];
    const footnote = {};

    // Extract origin reference (\fr)
    const refMatch = content.match(/\\fr\s+([\d:]+)/);
    if (refMatch) footnote.ref = refMatch[1];

    // Extract footnote text (\ft) - extract everything after \ft
    const textMatch = content.match(/\\ft\s+(.*?)$/s);
    if (textMatch) {
      let fnText = textMatch[1];
      // Clean Hebrew word markers but keep the text
      fnText = fnText.replace(/\\\+wh\s+(.*?)\\\+wh\*/g, '$1');
      // Remove any other markers
      fnText = fnText.replace(/\\[a-z]+\s*/g, '');
      // Clean up
      fnText = fnText.trim();
      footnote.text = fnText;
    }

    footnotes.push(footnote);
  }

  return footnotes;
}

/**
 * Extract cross-references from text
 * Format: \x + \xo 1:1 \xt Matthew 5:3\x*
 */
function extractCrossRefs(text) {
  const crossRefs = [];
  const regex = /\\x\s+\+\s+(.*?)\\x\*/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const content = match[1];
    const crossRef = {};

    // Extract origin (\xo)
    const originMatch = content.match(/\\xo\s+([\d:]+)/);
    if (originMatch) crossRef.origin = originMatch[1];

    // Extract target references (\xt)
    const targetMatch = content.match(/\\xt\s+(.*?)(?=\\|$)/);
    if (targetMatch) crossRef.refs = cleanText(targetMatch[1]);

    crossRefs.push(crossRef);
  }

  return crossRefs;
}

/**
 * Parse a single USFM file
 * Strategy: Read entire content as string, extract verse blocks properly
 */
function parseUSFMFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  const result = {
    book: null,
    chapters: {}
  };

  // Extract book ID
  const bookMatch = content.match(/\\id\s+([A-Z0-9]+)/);
  if (bookMatch && BOOK_MAP[bookMatch[1]]) {
    result.book = BOOK_MAP[bookMatch[1]].name;
  }

  // Split into chapters
  const chapterSections = content.split(/\\c\s+(\d+)/);

  for (let i = 1; i < chapterSections.length; i += 2) {
    const chapterNum = parseInt(chapterSections[i]);
    const chapterContent = chapterSections[i + 1];

    if (!chapterNum || !chapterContent) continue;

    result.chapters[chapterNum] = [];

    // Track paragraph/poetry state across verses. Each verse is split into
    // segments at \p / \q\d? marker boundaries — preserving the exact point
    // where styling changes within a verse (e.g. prose intro to an OT poetry
    // quote). The state at verse start = the last marker seen in the previous
    // verse's text (or chapter preamble).
    // `nextSegmentStarts` tells the renderer that the next text segment
    // begins a new block (explicit marker fired) vs continues the previous
    // run of segments.
    let currentSegmentType = 'paragraph';
    let nextSegmentStarts = false;
    let pendingHeading = null;

    // Split into verse sections
    const verseSections = chapterContent.split(/\\v\s+(\d+)/);

    // Process content before first verse (may have headings, paragraph markers)
    const preVerseContent = verseSections[0];
    const headingMatch = preVerseContent.match(/\\s\d?\s+(.+?)(?=\\|$)/s);
    if (headingMatch) {
      pendingHeading = cleanText(headingMatch[1]);
    }
    const descMatch = preVerseContent.match(/\\d\s+(.+)$/m);
    if (descMatch) {
      pendingHeading = cleanText(descMatch[1]);
    }
    // Initial segment type = last paragraph/poetry marker in preVerseContent
    const preMarkers = [...preVerseContent.matchAll(/\\(p|m|mi|nb|pi\d?|q\d?|qs)(?=\s|$)/g)];
    if (preMarkers.length > 0) {
      const tag = preMarkers[preMarkers.length - 1][1];
      if (tag === 'qs') currentSegmentType = 'poetry1';
      else if (tag.startsWith('q')) currentSegmentType = `poetry${tag.slice(1) || '1'}`;
      else currentSegmentType = 'paragraph';
      nextSegmentStarts = true;
    }

    // Process each verse
    for (let j = 1; j < verseSections.length; j += 2) {
      const verseNum = parseInt(verseSections[j]);
      let verseText = verseSections[j + 1];

      if (!verseNum || !verseText) continue;

      // Extract until next major marker (next verse handled by split)
      // Keep collecting until we hit \v, \c, or end
      verseText = verseText.split(/(?=\\v\s+\d+|\\c\s+\d+)/)[0];

      // Capture \s (section heading) or \d (description) markers that trail
      // after verse text — these are headings for the NEXT verse.
      // We extract them before cleaning so they don't get stripped silently.
      let trailingHeading = null;
      const trailingSectionMatch = verseText.match(/\\s\d?\s+(.+?)(?=\\|$)/s);
      if (trailingSectionMatch) {
        trailingHeading = cleanText(trailingSectionMatch[1]);
      }
      const trailingDescMatch = verseText.match(/\\d\s+(.+)$/m);
      if (trailingDescMatch) {
        trailingHeading = cleanText(trailingDescMatch[1]);
      }

      // Extract Strong's word data BEFORE cleaning
      const words = extractWords(verseText);

      // Extract footnotes and cross-refs (they can be multi-line)
      const footnotes = extractFootnotes(verseText);
      const crossRefs = extractCrossRefs(verseText);

      // Build segments by walking \p / \q\d? marker boundaries in order.
      // Each segment carries its own type so the renderer can apply correct
      // indent level per line rather than to the whole verse.
      const segments = [];
      let segmentSource = verseText
        .replace(/\\f\s+\+\s+.*?\\f\*/gs, '')      // strip footnotes
        .replace(/\\x\s+\+\s+.*?\\x\*/gs, '')      // strip cross-refs
        .replace(/\\s\d?\s+.+?(?=\\|$)/gs, '')     // strip section headings
        .replace(/\\d\s+.+/g, '');                 // strip description markers

      // Paragraph markers: \p (regular), \m (continuation), \mi (indented continuation),
      // \nb (no-break), \pi\d? (indented paragraph). All map to type 'paragraph'.
      // Poetry markers: \q\d? (level 1-9), \qs (selah, treat as poetry1).
      const segmentMarkerRegex = /\\(p|m|mi|nb|pi\d?|q\d?|qs)(?=\s|$)/g;
      let segmentLastIdx = 0;
      let segmentMatch;
      while ((segmentMatch = segmentMarkerRegex.exec(segmentSource)) !== null) {
        const slice = segmentSource.slice(segmentLastIdx, segmentMatch.index);
        const cleaned = cleanText(slice);
        if (cleaned) {
          const seg = { type: currentSegmentType, text: cleaned };
          if (nextSegmentStarts) seg.start = true;
          segments.push(seg);
          nextSegmentStarts = false;
        }
        const tag = segmentMatch[1];
        if (tag === 'qs') {
          currentSegmentType = 'poetry1';
        } else if (tag.startsWith('q')) {
          currentSegmentType = `poetry${tag.slice(1) || '1'}`;
        } else {
          currentSegmentType = 'paragraph';
        }
        nextSegmentStarts = true;
        segmentLastIdx = segmentMatch.index + segmentMatch[0].length;
      }
      const tailSlice = segmentSource.slice(segmentLastIdx);
      const tailCleaned = cleanText(tailSlice);
      if (tailCleaned) {
        const seg = { type: currentSegmentType, text: tailCleaned };
        if (nextSegmentStarts) seg.start = true;
        segments.push(seg);
        nextSegmentStarts = false;
      }

      if (segments.length === 0) continue;

      // Flattened text for backward compat (clipping, search, anything that
      // just wants the verse as a string)
      const verseTextFlat = segments.map(s => s.text).join(' ');

      const verseObj = {
        number: verseNum,
        text: verseTextFlat,
        // `type` = first segment's type. Used by passage-chunking which needs
        // a single per-verse classification; the renderer uses `segments` for
        // accurate per-line styling.
        type: segments[0].type,
        segments
      };

      // Add Strong's word data if present
      if (words && words.length > 0) {
        verseObj.words = words;
      }

      // Add heading if pending
      if (pendingHeading) {
        verseObj.heading = pendingHeading;
        pendingHeading = null;
      }

      // Add footnotes if present
      if (footnotes.length > 0) {
        verseObj.footnotes = footnotes;
      }

      // Add cross-refs if present
      if (crossRefs.length > 0) {
        verseObj.crossRefs = crossRefs;
      }

      result.chapters[chapterNum].push(verseObj);

      // If this verse's trailing content had a \d or \s marker,
      // set it as heading for the next verse
      if (trailingHeading) {
        pendingHeading = trailingHeading;
      }
    }
  }

  return result;
}

/**
 * Main conversion function
 */
function convertUSFMDirectory(inputDir, outputFile) {
  const files = fs.readdirSync(inputDir)
    .filter(f => f.endsWith('.usfm'))
    .filter(f => {
      // Only process 66 canonical books (skip deuterocanonical)
      const match = f.match(/\d+-([A-Z0-9]+)eng/);
      if (!match) return false;
      return BOOK_MAP[match[1]] !== undefined;
    })
    .sort();

  console.log(`Found ${files.length} canonical books to convert`);

  const bible = [];

  for (const file of files) {
    const bookCode = file.match(/\d+-([A-Z0-9]+)eng/)[1];
    const bookInfo = BOOK_MAP[bookCode];

    if (!bookInfo) continue;

    console.log(`Processing ${bookInfo.name}...`);

    const filepath = path.join(inputDir, file);
    const parsed = parseUSFMFile(filepath);

    const bookData = {
      number: bookInfo.number,
      name: bookInfo.name,
      testament: bookInfo.testament,
      chapters: []
    };

    // Convert chapters object to array
    for (let chapterNum in parsed.chapters) {
      bookData.chapters.push({
        number: parseInt(chapterNum),
        verses: parsed.chapters[chapterNum]
      });
    }

    bible.push(bookData);
  }

  // Sort by book number
  bible.sort((a, b) => a.number - b.number);

  // Write output
  const output = {
    version: 'WEB',
    name: 'World English Bible',
    copyright: 'Public Domain',
    books: bible
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\n✅ Conversion complete!`);
  console.log(`Output: ${outputFile}`);
  console.log(`Size: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`);
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node usfm-converter.js <input-dir> <output-file>');
    console.log('Example: node usfm-converter.js /tmp/web_usfm web-bible-enhanced.json');
    process.exit(1);
  }

  const [inputDir, outputFile] = args;
  convertUSFMDirectory(inputDir, outputFile);
}

module.exports = { convertUSFMDirectory, parseUSFMFile };
