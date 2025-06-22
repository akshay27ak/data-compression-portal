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

    // Generate proper filename based on algorithm and original file
    const compressedFileId = uuidv4()
    const originalName = path.parse(fileMetadata.originalName).name
    const originalExt = path.parse(fileMetadata.originalName).ext

    let compressedFileName, compressedFilePath

    if (algorithm === "jpeg") {
      // JPEG creates .jpeg files (industry standard)
      compressedFileName = `${originalName}_compressed.jpeg`
      compressedFilePath = path.join("processed", compressedFileName)
    } else {
      // Other algorithms create .bin files but store original extension in metadata
      compressedFileName = `${originalName}_compressed_${algorithm}.bin`
      compressedFilePath = path.join("processed", compressedFileName)
    }

    fs.writeFileSync(compressedFilePath, compressedData)

    // Save compressed file metadata with original file info
    const compressedMetadata = {
      fileId: compressedFileId,
      originalFileId: fileId,
      originalName: fileMetadata.originalName,
      originalExtension: originalExt, // Store original extension for decompression
      originalMimeType: fileMetadata.mimeType, // Store original MIME type
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
      processedSize: compressedSize,
      processingTime: processingTime,
      timeTaken: processingTime,
      compressionRatio: Number.parseFloat(compressedMetadata.compressionRatio),
      algorithm: algorithm,
      explanation: explanation,
      fileName: compressedFileName, // Return the actual filename
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

    // Load file metadata - check both uploads and processed directories
    let metadataPath = path.join("uploads", `${fileId}.json`)
    let isFromProcessed = false

    if (!fs.existsSync(metadataPath)) {
      // Check in processed directory (for compressed files)
      metadataPath = path.join("processed", `${fileId}.json`)
      isFromProcessed = true
    }

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({
        message: "File not found. Please upload a compressed file created by this system.",
      })
    }

    const fileMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    const filePath = fileMetadata.filePath

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Compressed file not found",
      })
    }

    // Verify this is a compressed file
    if (isFromProcessed && fileMetadata.action !== "compress") {
      return res.status(400).json({
        message: "This file was not created by compression. Please upload a compressed file.",
      })
    }

    // Verify algorithm matches
    if (isFromProcessed && fileMetadata.algorithm !== algorithm) {
      return res.status(400).json({
        message: `This file was compressed with ${fileMetadata.algorithm}, but you selected ${algorithm}. Please select the correct algorithm.`,
      })
    }

    console.log(`📦 Starting decompression: ${algorithm} on ${fileMetadata.fileName || fileMetadata.originalName}`)
    const startTime = Date.now()

    // Read compressed file
    const compressedData = fs.readFileSync(filePath)
    const compressedSize = compressedData.length

    // Decompress using selected algorithm
    const decompressedData = await algorithms[algorithm].decompress(compressedData)
    const decompressedSize = decompressedData.length

    const endTime = Date.now()
    const processingTime = ((endTime - startTime) / 1000).toFixed(2)

    // Generate proper filename for decompressed file
    const decompressedFileId = uuidv4()
    let decompressedFileName, decompressedFilePath

    if (isFromProcessed && fileMetadata.originalName && fileMetadata.originalExtension) {
      // Restore original filename and extension
      const originalName = path.parse(fileMetadata.originalName).name
      const originalExt = fileMetadata.originalExtension

      if (algorithm === "jpeg") {
        // JPEG decompression creates PNG files (lossless format)
        decompressedFileName = `${originalName}_decompressed.png`
      } else {
        // Other algorithms restore to original extension
        decompressedFileName = `${originalName}_decompressed${originalExt}`
      }
    } else {
      // Fallback for files without proper metadata
      const baseName = path.parse(fileMetadata.originalName || fileMetadata.fileName || "file").name

      if (algorithm === "jpeg") {
        decompressedFileName = `${baseName}_decompressed.png`
      } else {
        decompressedFileName = `${baseName}_decompressed.bin`
      }
    }

    decompressedFilePath = path.join("processed", decompressedFileName)
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
      // Preserve original file info if available
      restoredFromCompression: isFromProcessed,
      originalFileExtension: fileMetadata.originalExtension,
      originalMimeType: fileMetadata.originalMimeType,
    }

    const decompressedMetadataPath = path.join("processed", `${decompressedFileId}.json`)
    fs.writeFileSync(decompressedMetadataPath, JSON.stringify(decompressedMetadata, null, 2))

    console.log(`✅ Decompression completed: ${compressedSize} → ${decompressedSize} bytes`)

    // Generate explanation based on algorithm and whether it was properly compressed
    let explanation
    if (algorithm === "jpeg") {
      explanation = `JPEG decompression converted your compressed image back to PNG format. The original image data has been restored, though some quality loss occurred during the original JPEG compression.`
    } else if (isFromProcessed) {
      explanation = `Successfully decompressed your file using ${algorithm} algorithm. The original file has been perfectly restored with the original filename and extension.`
    } else {
      explanation = `Decompression completed using ${algorithm} algorithm. Note: For best results, upload files that were compressed using this system.`
    }

    res.json({
      fileId: decompressedFileId,
      originalSize: compressedSize,
      decompressedSize: decompressedSize,
      processedSize: decompressedSize,
      processingTime: processingTime,
      timeTaken: processingTime,
      algorithm: algorithm,
      explanation: explanation,
      fileName: decompressedFileName,
      restoredOriginal: isFromProcessed,
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
      text: `Huffman coding achieved ${ratio}% compression by analyzing character frequencies in your text file. The compressed file is saved as .bin format but will restore to your original text file when decompressed.`,
      image: `Huffman coding achieved ${ratio}% compression on your image. The compressed file is saved as .bin format but will restore to your original image file when decompressed.`,
      binary: `Huffman coding achieved ${ratio}% compression on your binary file by creating variable-length codes. The compressed .bin file will restore to your original file format when decompressed.`,
    },
    rle: {
      text: `Run-Length Encoding achieved ${ratio}% compression on your text file. The compressed .bin file contains the encoded data and will restore to your original text file when decompressed.`,
      image: `Run-Length Encoding achieved ${ratio}% compression by efficiently encoding consecutive pixels. The compressed .bin file will restore to your original image when decompressed.`,
      binary: `Run-Length Encoding achieved ${ratio}% compression by replacing repeated byte sequences. The compressed .bin file will restore to your original file when decompressed.`,
    },
    lz77: {
      text: `LZ77 achieved ${ratio}% compression by finding repeated text patterns. The compressed .bin file contains dictionary references and will restore to your original text file when decompressed.`,
      image: `LZ77 achieved ${ratio}% compression by identifying repeated pixel patterns. The compressed .bin file will restore to your original image when decompressed.`,
      binary: `LZ77 achieved ${ratio}% compression using sliding window compression. The compressed .bin file will restore to your original file format when decompressed.`,
    },
    jpeg: {
      text: `JPEG compression achieved ${ratio}% size reduction and created a .jpeg file. Note: This algorithm is designed for images, not text files.`,
      image: `JPEG compression achieved ${ratio}% size reduction by creating an industry-standard .jpeg file. This can be opened in any image viewer and will decompress to PNG format if needed.`,
      binary: `JPEG compression achieved ${ratio}% size reduction and created a .jpeg file. Note: This algorithm is designed for images, not binary data.`,
    },
  }

  return (
    explanations[algorithm]?.[fileType] ||
    `${algorithm} achieved ${ratio}% compression and saved the result appropriately.`
  )
}

module.exports = router
