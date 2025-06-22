const express = require("express")
const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

// Import compression algorithms
const huffmanAlgorithm = require("../algorithms/huffman")
const rleAlgorithm = require("../algorithms/rle")
const lz77Algorithm = require("../algorithms/lz77")
const jpegAlgorithm = require("../algorithms/jpeg")

const router = express.Router()

// Algorithm mapping
const algorithms = {
  huffman: huffmanAlgorithm,
  rle: rleAlgorithm,
  lz77: lz77Algorithm,
  jpeg: jpegAlgorithm,
}

// Compression endpoint
router.post("/", async (req, res) => {
  try {
    const { fileId, algorithm } = req.body

    if (!fileId || !algorithm) {
      return res.status(400).json({
        message: "fileId and algorithm are required",
      })
    }

    if (!algorithms[algorithm]) {
      return res.status(400).json({
        message: `Unsupported algorithm: ${algorithm}. Supported: ${Object.keys(algorithms).join(", ")}`,
      })
    }

    // Load file metadata
    const metadataPath = path.join("uploads", `${fileId}.json`)
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({
        message: "File not found",
      })
    }

    const fileMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    const filePath = fileMetadata.filePath

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Original file not found",
      })
    }

    console.log(`🗜️ Starting compression: ${algorithm} on ${fileMetadata.originalName}`)
    const startTime = Date.now()

    // Read original file
    const originalData = fs.readFileSync(filePath)
    const originalSize = originalData.length

    // Compress using selected algorithm
    const compressedData = await algorithms[algorithm].compress(originalData)
    const compressedSize = compressedData.length

    const endTime = Date.now()
    const processingTime = ((endTime - startTime) / 1000).toFixed(2)

    // Save compressed file with appropriate extension
    const compressedFileId = uuidv4()
    let compressedFileName, compressedFilePath

    if (algorithm === "jpeg") {
      // For JPEG, save as .jpg file
      compressedFileName = `${compressedFileId}_compressed.jpg`
      compressedFilePath = path.join("processed", compressedFileName)
    } else {
      // For other algorithms, save as .bin file
      compressedFileName = `${compressedFileId}_compressed_${algorithm}.bin`
      compressedFilePath = path.join("processed", compressedFileName)
    }

    fs.writeFileSync(compressedFilePath, compressedData)

    // Save compressed file metadata
    const compressedMetadata = {
      fileId: compressedFileId,
      originalFileId: fileId,
      originalName: fileMetadata.originalName,
      fileName: compressedFileName,
      filePath: compressedFilePath,
      algorithm: algorithm,
      action: "compress",
      originalSize: originalSize,
      processedSize: compressedSize,
      processingTime: processingTime,
      compressionRatio: (((originalSize - compressedSize) / originalSize) * 100).toFixed(1),
      timestamp: new Date().toISOString(),
    }

    const compressedMetadataPath = path.join("processed", `${compressedFileId}.json`)
    fs.writeFileSync(compressedMetadataPath, JSON.stringify(compressedMetadata, null, 2))

    console.log(
      `✅ Compression completed: ${originalSize} → ${compressedSize} bytes (${compressedMetadata.compressionRatio}% reduction)`,
    )

    // Generate performance explanation
    const explanation = generateCompressionExplanation(
      algorithm,
      compressedMetadata.compressionRatio,
      fileMetadata.mimeType,
    )

    res.json({
      fileId: compressedFileId,
      originalSize: originalSize,
      compressedSize: compressedSize,
      processingTime: processingTime,
      compressionRatio: Number.parseFloat(compressedMetadata.compressionRatio),
      algorithm: algorithm,
      explanation: explanation,
      message: "File compressed successfully",
    })
  } catch (error) {
    console.error("Compression error:", error)
    res.status(500).json({
      message: "Compression failed",
      error: error.message,
    })
  }
})

// Decompression endpoint
router.post("/decompress", async (req, res) => {
  try {
    const { fileId, algorithm } = req.body

    if (!fileId || !algorithm) {
      return res.status(400).json({
        message: "fileId and algorithm are required",
      })
    }

    if (!algorithms[algorithm]) {
      return res.status(400).json({
        message: `Unsupported algorithm: ${algorithm}. Supported: ${Object.keys(algorithms).join(", ")}`,
      })
    }

    // Load file metadata
    const metadataPath = path.join("uploads", `${fileId}.json`)
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({
        message: "File not found",
      })
    }

    const fileMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    const filePath = fileMetadata.filePath

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Original file not found",
      })
    }

    console.log(`📦 Starting decompression: ${algorithm} on ${fileMetadata.originalName}`)
    const startTime = Date.now()

    // Read compressed file
    const compressedData = fs.readFileSync(filePath)
    const compressedSize = compressedData.length

    // Decompress using selected algorithm
    const decompressedData = await algorithms[algorithm].decompress(compressedData)
    const decompressedSize = decompressedData.length

    const endTime = Date.now()
    const processingTime = ((endTime - startTime) / 1000).toFixed(2)

    // Save decompressed file
    const decompressedFileId = uuidv4()
    let decompressedFileName, decompressedFilePath

    if (algorithm === "jpeg") {
      // For JPEG decompression, save as .png (raw image data)
      decompressedFileName = `${decompressedFileId}_decompressed.png`
      decompressedFilePath = path.join("processed", decompressedFileName)
    } else {
      // For other algorithms, save as .bin file
      decompressedFileName = `${decompressedFileId}_decompressed_${algorithm}.bin`
      decompressedFilePath = path.join("processed", decompressedFileName)
    }

    fs.writeFileSync(decompressedFilePath, decompressedData)

    // Save decompressed file metadata
    const decompressedMetadata = {
      fileId: decompressedFileId,
      originalFileId: fileId,
      originalName: fileMetadata.originalName,
      fileName: decompressedFileName,
      filePath: decompressedFilePath,
      algorithm: algorithm,
      action: "decompress",
      originalSize: compressedSize,
      processedSize: decompressedSize,
      processingTime: processingTime,
      timestamp: new Date().toISOString(),
    }

    const decompressedMetadataPath = path.join("processed", `${decompressedFileId}.json`)
    fs.writeFileSync(decompressedMetadataPath, JSON.stringify(decompressedMetadata, null, 2))

    console.log(`✅ Decompression completed: ${compressedSize} → ${decompressedSize} bytes`)

    const explanation =
      algorithm === "jpeg"
        ? `JPEG decompression converted your compressed image back to raw image data (PNG format). Note: Some quality loss occurred during the original JPEG compression as it's a lossy format.`
        : `Successfully decompressed your file using ${algorithm} algorithm. The original data has been perfectly restored with no quality loss.`

    res.json({
      fileId: decompressedFileId,
      originalSize: compressedSize,
      decompressedSize: decompressedSize,
      processingTime: processingTime,
      algorithm: algorithm,
      explanation: explanation,
      message: "File decompressed successfully",
    })
  } catch (error) {
    console.error("Decompression error:", error)
    res.status(500).json({
      message: "Decompression failed",
      error: error.message,
    })
  }
})

function generateCompressionExplanation(algorithm, ratio, mimeType) {
  const fileType = mimeType?.startsWith("text/") ? "text" : mimeType?.startsWith("image/") ? "image" : "binary"

  const explanations = {
    huffman: {
      text: `Huffman coding achieved ${ratio}% compression by analyzing character frequencies in your text file. Common characters were assigned shorter codes, making this algorithm highly effective for text data.`,
      image: `Huffman coding achieved ${ratio}% compression on your image. While not optimal for images due to uniform pixel distribution, it still provided compression by encoding frequent color values with shorter codes.`,
      binary: `Huffman coding achieved ${ratio}% compression on your binary file by creating variable-length codes based on byte frequency patterns found in the data structure.`,
    },
    rle: {
      text: `Run-Length Encoding achieved ${ratio}% compression on your text file. This algorithm works best with repeated characters, so the compression ratio depends on consecutive identical characters in your text.`,
      image: `Run-Length Encoding achieved ${ratio}% compression by efficiently encoding consecutive pixels of the same color. This algorithm excels with images containing large uniform areas.`,
      binary: `Run-Length Encoding achieved ${ratio}% compression by replacing sequences of identical bytes with count-value pairs. The effectiveness depends on repetitive patterns in your binary data.`,
    },
    lz77: {
      text: `LZ77 achieved ${ratio}% compression by finding and referencing repeated phrases and words in your text. This dictionary-based approach is excellent for text with recurring patterns.`,
      image: `LZ77 achieved ${ratio}% compression by identifying repeated pixel patterns and replacing them with references to earlier occurrences. This works well for images with recurring visual elements.`,
      binary: `LZ77 achieved ${ratio}% compression using its sliding window approach to find repeated byte sequences in your binary file. This general-purpose algorithm adapts well to various data patterns.`,
    },
    jpeg: {
      text: `JPEG compression achieved ${ratio}% size reduction, but this algorithm is not recommended for text files as it's designed for photographic images and may introduce artifacts.`,
      image: `JPEG compression achieved ${ratio}% size reduction by removing visual information that's less perceptible to human eyes. This lossy compression is specifically optimized for photographic images and creates industry-standard .jpg files.`,
      binary: `JPEG compression achieved ${ratio}% size reduction, but this algorithm is not suitable for binary data and may cause data corruption. Use lossless algorithms for binary files.`,
    },
  }

  return explanations[algorithm]?.[fileType] || `${algorithm} achieved ${ratio}% compression on your file.`
}

module.exports = router
