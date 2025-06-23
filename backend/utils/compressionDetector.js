const fs = require("fs")
const path = require("path")

// File signature detection for compressed files
const detectCompressedFile = (filePath, fileName) => {
  try {
    // Check file extension patterns for our compressed files
    if (fileName.includes("_compressed_huffman.bin")) {
      return { isCompressed: true, algorithm: "huffman", originalExt: extractOriginalExtension(fileName) }
    }
    if (fileName.includes("_compressed_rle.bin")) {
      return { isCompressed: true, algorithm: "rle", originalExt: extractOriginalExtension(fileName) }
    }
    if (fileName.includes("_compressed_lz77.bin")) {
      return { isCompressed: true, algorithm: "lz77", originalExt: extractOriginalExtension(fileName) }
    }

    // Check for JPEG files
    if (fileName.toLowerCase().match(/\.(jpg|jpeg)$/)) {
      return { isCompressed: true, algorithm: "jpeg", originalExt: ".jpg" }
    }

    // Check file signatures (magic numbers)
    const buffer = fs.readFileSync(filePath)

    if (buffer.length >= 8) {
      // Check for JPEG signature
      if (buffer[0] === 0xff && buffer[1] === 0xd8) {
        return { isCompressed: true, algorithm: "jpeg", originalExt: ".jpg" }
      }
    }

    return { isCompressed: false, algorithm: null, originalExt: null }
  } catch (error) {
    return { isCompressed: false, algorithm: null, originalExt: null }
  }
}

const extractOriginalExtension = (fileName) => {
  // Extract original extension from filename like "document_compressed_huffman.bin"
  const parts = fileName.split("_compressed_")
  if (parts.length > 1) {
    const originalName = parts[0]
    const lastDot = originalName.lastIndexOf(".")
    if (lastDot !== -1) {
      return originalName.substring(lastDot)
    }
  }
  return ".txt" // Default fallback
}

module.exports = {
  detectCompressedFile,
  extractOriginalExtension,
}
