/**
 * Load and decompress gzipped Bible JSON files
 */

/**
 * Fetch and decompress a gzipped JSON file
 * @param {string} url - URL to the .json.gz file
 * @returns {Promise<Object>} - Parsed JSON object
 */
async function loadGzippedJSON(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    // Get the compressed data as a blob
    const blob = await response.blob();
    
    // Create a decompression stream
    const decompressedStream = blob.stream().pipeThrough(
      new DecompressionStream('gzip')
    );
    
    // Read the decompressed data
    const decompressedBlob = await new Response(decompressedStream).blob();
    const text = await decompressedBlob.text();
    
    // Parse JSON
    return JSON.parse(text);
  } catch (error) {
    console.error('Error loading gzipped JSON:', error);
    throw error;
  }
}

/**
 * Load a Bible version (auto-detects .json.gz or .json)
 * @param {string} version - Version code (e.g., 'web', 'asv', 'kjv')
 * @returns {Promise<Object>} - Bible data
 */
async function loadBibleVersion(version) {
  const gzippedUrl = `data/${version}-bible-enhanced.json.gz`;
  const fallbackUrl = `data/${version}-bible-enhanced.json`;
  
  try {
    // Try gzipped version first
    return await loadGzippedJSON(gzippedUrl);
  } catch (error) {
    console.warn(`Gzipped version failed, trying uncompressed: ${fallbackUrl}`);
    
    // Fall back to uncompressed JSON
    const response = await fetch(fallbackUrl);
    if (!response.ok) {
      throw new Error(`Failed to load Bible: ${response.status}`);
    }
    return await response.json();
  }
}

// Export for use in modules or global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadGzippedJSON, loadBibleVersion };
}
