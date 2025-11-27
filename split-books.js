#!/usr/bin/env node

/**
 * Split enhanced Bible JSON into individual book files
 * Usage: node split-books.js web|asv|kjv
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const version = process.argv[2] || 'web';
const inputFile = `data/${version}-bible-enhanced.json`;
const outputDir = `data/${version}-books`;

console.log(`\n📖 Splitting ${version.toUpperCase()} Bible into individual books...\n`);

// Create output directory
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Load the full Bible
console.log(`Reading ${inputFile}...`);
const bible = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

console.log(`Found ${bible.books.length} books\n`);

let totalOriginalSize = 0;
let totalCompressedSize = 0;

// Split each book
bible.books.forEach((book, index) => {
    const bookData = {
        version: bible.version,
        books: [book]
    };

    const bookFileName = `${String(book.number).padStart(2, '0')}-${book.id}.json`;
    const bookFilePath = path.join(outputDir, bookFileName);

    // Write uncompressed
    const jsonStr = JSON.stringify(bookData);
    fs.writeFileSync(bookFilePath, jsonStr);

    // Gzip compress
    execSync(`gzip -9 -f "${bookFilePath}"`);

    const originalSize = Buffer.byteLength(jsonStr, 'utf8');
    const compressedSize = fs.statSync(bookFilePath + '.gz').size;

    totalOriginalSize += originalSize;
    totalCompressedSize += compressedSize;

    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    console.log(`✓ ${book.name.padEnd(20)} ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${compressionRatio}% reduction)`);
});

console.log(`\n📊 Total: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB → ${(totalCompressedSize / 1024).toFixed(1)}KB`);
console.log(`   Average book size: ${(totalCompressedSize / bible.books.length / 1024).toFixed(1)}KB\n`);
console.log(`✅ Done! Books saved to ${outputDir}/\n`);
