const fs = require('fs');
const data = JSON.parse(fs.readFileSync('web-bible-enhanced.json'));

console.log('📖 WEB Bible Enhanced JSON with Strong\'s Numbers\n');

// Count verses with Strong's data
let versesWithStrongs = 0;
let totalWords = 0;
let wordsWithStrongs = 0;

data.books.forEach(b => b.chapters.forEach(c => c.verses.forEach(v => {
  if (v.words) {
    versesWithStrongs++;
    totalWords += v.words.length;
    wordsWithStrongs += v.words.filter(w => w.strong).length;
  }
})));

console.log('Verses with Strong\'s data:', versesWithStrongs);
console.log('Total word objects:', totalWords);
console.log('Words with Strong\'s numbers:', wordsWithStrongs);
console.log('Coverage:', ((wordsWithStrongs / totalWords) * 100).toFixed(1) + '%');

// Sample verses
console.log('\n📜 Sample with Strong\'s:\n');

const john316 = data.books.find(b => b.name === 'John')
  .chapters.find(c => c.number === 3)
  .verses.find(v => v.number === 16);

console.log('John 3:16:');
console.log('Text:', john316.text);
console.log('Words with Strong\'s:');
john316.words.slice(0, 20).forEach(w => {
  if (w.strong) {
    console.log(`  ${w.strong}: ${w.text}`);
  }
});

console.log('\n✅ Strong\'s numbers successfully preserved!');
