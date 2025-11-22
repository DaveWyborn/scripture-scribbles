const fs = require('fs');
const data = JSON.parse(fs.readFileSync('web-bible-enhanced.json'));

console.log('📖 WEB Bible Enhanced JSON - Conversion Summary\n');
console.log('Books:', data.books.length);
console.log('Total chapters:', data.books.reduce((acc, b) => acc + b.chapters.length, 0));
console.log('Total verses:', data.books.reduce((acc, b) => acc + b.chapters.reduce((a, c) => a + c.verses.length, 0), 0));

const stats = {
  paragraph: 0,
  poetry1: 0,
  poetry2: 0,
  poetry3: 0,
  poetry4: 0,
  footnotes: 0,
  crossRefs: 0,
  headings: 0
};

data.books.forEach(b => b.chapters.forEach(c => c.verses.forEach(v => {
  if (v.type) {
    if (!stats[v.type]) stats[v.type] = 0;
    stats[v.type]++;
  }
  if (v.footnotes) stats.footnotes += v.footnotes.length;
  if (v.crossRefs) stats.crossRefs += v.crossRefs.length;
  if (v.heading) stats.headings++;
})));

console.log('\nContent features:');
console.log('  Paragraphs:', stats.paragraph);
console.log('  Poetry level 1:', stats.poetry1);
console.log('  Poetry level 2:', stats.poetry2);
console.log('  Poetry level 3:', stats.poetry3 || 0);
console.log('  Footnotes:', stats.footnotes);
console.log('  Cross-references:', stats.crossRefs);
console.log('  Headings:', stats.headings);

// Sample verses
console.log('\n📜 Sample verses:\n');

const gen1 = data.books[0].chapters[0].verses[0];
console.log('Genesis 1:1:', gen1.text);

const matt51 = data.books.find(b => b.name === 'Matthew').chapters.find(c => c.number === 5).verses.find(v => v.number === 1);
console.log('Matthew 5:1:', matt51.text);

const psalm1 = data.books.find(b => b.name === 'Psalms').chapters.find(c => c.number === 1).verses.find(v => v.number === 1);
console.log('Psalm 1:1 (poetry):', psalm1.text);

const john316 = data.books.find(b => b.name === 'John').chapters.find(c => c.number === 3).verses.find(v => v.number === 16);
console.log('John 3:16:', john316.text);

console.log('\n✅ Conversion successful!');
