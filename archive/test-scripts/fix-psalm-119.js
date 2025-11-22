const fs = require('fs');

// Hebrew letters for Psalm 119 (22 letters, 8 verses each = 176 verses)
const hebrewLetters = [
  'ALEPH',   // v1-8
  'BETH',    // v9-16
  'GIMEL',   // v17-24
  'DALETH',  // v25-32
  'HE',      // v33-40
  'VAV',     // v41-48
  'ZAYIN',   // v49-56
  'HETH',    // v57-64
  'TETH',    // v65-72
  'YODH',    // v73-80
  'KAPH',    // v81-88
  'LAMEDH',  // v89-96
  'MEM',     // v97-104
  'NUN',     // v105-112
  'SAMEKH',  // v113-120
  'AYIN',    // v121-128
  'PE',      // v129-136
  'TSADHE',  // v137-144
  'QOPH',    // v145-152
  'RESH',    // v153-160
  'SHIN',    // v161-168
  'TAV'      // v169-176
];

console.log('Reading web-bible-enhanced.json...');
const bible = JSON.parse(fs.readFileSync('web-bible-enhanced.json', 'utf8'));

// Find Psalms book (book 19)
const psalms = bible.books.find(b => b.number === 19);
if (!psalms) {
  console.error('Psalms not found!');
  process.exit(1);
}

// Find Psalm 119 (chapter 119)
const psalm119 = psalms.chapters.find(c => c.number === 119);
if (!psalm119) {
  console.error('Psalm 119 not found!');
  process.exit(1);
}

console.log(`Found Psalm 119 with ${psalm119.verses.length} verses`);

// Add Hebrew letter headings to the first verse of each 8-verse section
let updatedCount = 0;
hebrewLetters.forEach((letter, index) => {
  const verseNumber = (index * 8) + 1;
  const verse = psalm119.verses.find(v => v.number === verseNumber);

  if (verse) {
    verse.heading = letter;
    console.log(`✓ Added "${letter}" heading to verse ${verseNumber}`);
    updatedCount++;
  } else {
    console.warn(`⚠ Verse ${verseNumber} not found`);
  }
});

console.log(`\nUpdated ${updatedCount} verses with Hebrew letter headings`);

// Write back to file
console.log('\nWriting updated JSON...');
fs.writeFileSync('web-bible-enhanced.json', JSON.stringify(bible, null, 2));

console.log('✅ Psalm 119 Hebrew letter headings fixed!');
console.log('\nVerify at: http://localhost:8001/fluid-reading-v2.html');
console.log('Navigate to: Psalms > Chapter 119');
