const express = require("express")
const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

const huffmanAlgorithm = require("../algorithms/huffman")
const rleAlgorithm = require("../algorithms/rle")
const lz77Algorithm = require("../algorithms/lz77")
const jpegAlgorithm = require("../algorithms/jpeg")

const router = express.Router()

const algorithms = {
  huffman: huffmanAlgorithm,
  rle: rleAlgorithm,
  lz77: lz77Algorithm,
  jpeg: jpegAlgorithm,
}

const extractOriginalExtension = (fileName) => {

  if (fileName.includes("_compressed_")) {
    const parts = fileName.split("_compressed_")
    if (parts.length > 0) {
      const originalPart = parts[0]
      const lastDot = originalPart.lastIndexOf(".")
      if (lastDot !== -1) {
        const ext = originalPart.substring(lastDot)
        return ext
      }
    }
  }

  const currentExt = path.extname(fileName)
  if (currentExt && currentExt !== ".bin") {
    return currentExt
  }

  return ".txt" 
}

const detectCompressedFile = (filePath, fileName) => {
  try {

    if (fileName.includes("_compressed_huffman.bin")) {
      const originalExt = extractOriginalExtension(fileName)
      return { isCompressed: true, algorithm: "huffman", originalExt: originalExt }
    }
    if (fileName.includes("_compressed_rle.bin")) {
      const originalExt = extractOriginalExtension(fileName)
      return { isCompressed: true, algorithm: "rle", originalExt: originalExt }
    }
    if (fileName.includes("_compressed_lz77.bin")) {
      const originalExt = extractOriginalExtension(fileName)
      return { isCompressed: true, algorithm: "lz77", originalExt: originalExt }
    }

    if (fileName.toLowerCase().match(/\.(jpg|jpeg)$/)) {
      return { isCompressed: true, algorithm: "jpeg", originalExt: ".jpg" }
    }

    return { isCompressed: false, algorithm: null, originalExt: null }
  } catch (error) {
    console.log(`Detection error: ${error.message}`)
    return { isCompressed: false, algorithm: null, originalExt: null }
  }
}

const createEnhancedMetadata = (fileInfo, action, algorithm, result, originalFileMetadata = null) => {
  const originalExt = originalFileMetadata?.originalExtension || path.extname(fileInfo.originalName)

  const metadata = {
    fileId: fileInfo.fileId || uuidv4(),
    action: action, 
    algorithm: algorithm,
    timestamp: new Date().toISOString(),
    processingTime: result.processingTime || "0.00",

    originalFile: {
      name: originalFileMetadata?.originalName || fileInfo.originalName,
      extension: originalExt, 
      mimeType: originalFileMetadata?.originalMimeType || fileInfo.mimeType,
      size: result.originalSize || fileInfo.originalSize,
      fullName: originalFileMetadata?.originalName || fileInfo.originalName,
      baseName: path.parse(originalFileMetadata?.originalName || fileInfo.originalName).name,
    },

    processedFile: {
      name: fileInfo.fileName,
      path: fileInfo.filePath,
      size: result.processedSize || result.compressedSize || result.decompressedSize,
      extension: path.extname(fileInfo.fileName),
    },

    compressionMetadata: {
      originalExtension: originalExt,
      originalMimeType: originalFileMetadata?.originalMimeType || fileInfo.mimeType,
      originalBaseName: path.parse(originalFileMetadata?.originalName || fileInfo.originalName).name,
      originalFullName: originalFileMetadata?.originalName || fileInfo.originalName,
      isCompressed: action === "compress",
      compressionAlgorithm: algorithm,
    },
  }

  if (action === "compress") {
    metadata.compressionRatio = result.compressionRatio
    metadata.explanation = result.explanation
  }

  return metadata
}

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

    if (fileMetadata.isCompressed) {
      return res.status(400).json({
        message: `This file is already compressed using ${fileMetadata.detectedAlgorithm}. Use decompress instead.`,
        isCompressed: true,
        detectedAlgorithm: fileMetadata.detectedAlgorithm,
      })
    }

    const startTime = Date.now()

    const originalData = fs.readFileSync(filePath)
    const originalSize = originalData.length

    const compressedData = await algorithms[algorithm].compress(originalData)
    const compressedSize = compressedData.length

    const endTime = Date.now()
    const processingTime = ((endTime - startTime) / 1000).toFixed(2)

    const compressedFileId = uuidv4()
    const originalName = path.parse(fileMetadata.originalName).name
    const originalExt = path.parse(fileMetadata.originalName).ext

    let compressedFileName, compressedFilePath

    if (algorithm === "jpeg") {
      compressedFileName = `${originalName}_compressed.jpeg`
      compressedFilePath = path.join("processed", compressedFileName)
    } else {
      compressedFileName = `${originalName}_compressed_${algorithm}.bin`
      compressedFilePath = path.join("processed", compressedFileName)
    }

    fs.writeFileSync(compressedFilePath, compressedData)

    const result = {
      originalSize: originalSize,
      processedSize: compressedSize,
      compressedSize: compressedSize,
      processingTime: processingTime,
      compressionRatio: (((originalSize - compressedSize) / originalSize) * 100).toFixed(1),
      explanation: generateCompressionExplanation(
        algorithm,
        (((originalSize - compressedSize) / originalSize) * 100).toFixed(1),
        fileMetadata.mimeType,
      ),
    }

    const enhancedMetadata = createEnhancedMetadata(
      {
        fileId: compressedFileId,
        fileName: compressedFileName,
        filePath: compressedFilePath,
        originalName: fileMetadata.originalName,
        mimeType: fileMetadata.mimeType, 
        originalSize: originalSize,
      },
      "compress",
      algorithm,
      result,
      {
        originalName: fileMetadata.originalName,
        originalExtension: originalExt, 
        originalMimeType: fileMetadata.mimeType, 
      },
    )

    const compressedMetadataPath = path.join("processed", `${compressedFileId}.json`)
    fs.writeFileSync(compressedMetadataPath, JSON.stringify(enhancedMetadata, null, 2))

    console.log(
      `Compression completed: ${originalSize} → ${compressedSize} bytes (${result.compressionRatio}% reduction)`,
    )

    res.json({
      fileId: compressedFileId,
      originalSize: originalSize,
      compressedSize: compressedSize,
      processedSize: compressedSize,
      processingTime: processingTime,
      timeTaken: processingTime,
      compressionRatio: Number.parseFloat(result.compressionRatio),
      algorithm: algorithm,
      explanation: result.explanation,
      fileName: compressedFileName,
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

    let metadataPath = path.join("uploads", `${fileId}.json`)
    let isFromProcessed = false

    if (!fs.existsSync(metadataPath)) {
      metadataPath = path.join("processed", `${fileId}.json`)
      isFromProcessed = true
    }

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({
        message: "File not found. Please upload a compressed file created by this system.",
      })
    }

    const fileMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    const filePath = fileMetadata.filePath || fileMetadata.processedFile?.path

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Compressed file not found",
      })
    }

    let isCompressed = false
    let detectedAlgorithm = null

    if (isFromProcessed) {
      isCompressed = fileMetadata.action === "compress"
      detectedAlgorithm = fileMetadata.algorithm
    } else {
      isCompressed = fileMetadata.isCompressed
      detectedAlgorithm = fileMetadata.detectedAlgorithm
    }

    if (!isCompressed) {
      return res.status(400).json({
        message: "This file is not compressed. Please upload a compressed file to decompress.",
        isCompressed: false,
      })
    }

    if (detectedAlgorithm && detectedAlgorithm !== algorithm) {
      return res.status(400).json({
        message: `This file was compressed with ${detectedAlgorithm}, but you selected ${algorithm}. Please select the correct algorithm.`,
        detectedAlgorithm: detectedAlgorithm,
      })
    }

    const startTime = Date.now()

    const compressedData = fs.readFileSync(filePath)
    const compressedSize = compressedData.length

    const decompressedData = await algorithms[algorithm].decompress(compressedData)
    const decompressedSize = decompressedData.length

    const endTime = Date.now()
    const processingTime = ((endTime - startTime) / 1000).toFixed(2)

    const decompressedFileId = uuidv4()
    let decompressedFileName, decompressedFilePath
    let originalBaseName = "file"
    let originalExtension = ".txt" // fallback


    if (fileMetadata.linkedCompressionMetadata && fileMetadata.linkedCompressionMetadata.compressionMetadata) {
      const linkedMeta = fileMetadata.linkedCompressionMetadata.compressionMetadata
      originalBaseName = linkedMeta.originalBaseName || "file"
      originalExtension = linkedMeta.originalExtension || ".txt"
    }
    else if (fileMetadata.originalFileMetadata) {
      originalBaseName = fileMetadata.originalFileMetadata.baseName || "file"
      originalExtension = fileMetadata.originalFileMetadata.extension || ".txt"
    }
    else if (fileMetadata.compressionMetadata) {
      originalBaseName = fileMetadata.compressionMetadata.originalBaseName || "file"
      originalExtension = fileMetadata.compressionMetadata.originalExtension || ".txt"
    }
    else if (fileMetadata.originalFile) {
      originalBaseName = fileMetadata.originalFile.baseName || path.parse(fileMetadata.originalFile.name).name
      originalExtension = fileMetadata.originalFile.extension
    }
    else if (fileMetadata.originalName || fileMetadata.fileName) {
      const fileName = fileMetadata.originalName || fileMetadata.fileName

      if (fileName.includes("_compressed_")) {
        const beforeCompressed = fileName.split("_compressed_")[0]
        const lastDotIndex = beforeCompressed.lastIndexOf(".")

        if (lastDotIndex !== -1) {
          originalBaseName = beforeCompressed.substring(0, lastDotIndex)
          originalExtension = beforeCompressed.substring(lastDotIndex)
        } else {
          originalBaseName = beforeCompressed
          originalExtension = ".bin" 
        }
      } else {
        originalBaseName = path.parse(fileName).name
        originalExtension = path.extname(fileName) || ".txt"
      }
    }

    if (algorithm === "jpeg") {
      decompressedFileName = `${originalBaseName}_decompressed.png`
    } else {
      decompressedFileName = `${originalBaseName}_decompressed${originalExtension}`
    }


    decompressedFilePath = path.join("processed", decompressedFileName)
    fs.writeFileSync(decompressedFilePath, decompressedData)

    const result = {
      originalSize: compressedSize,
      processedSize: decompressedSize,
      decompressedSize: decompressedSize,
      processingTime: processingTime,
    }

    const enhancedMetadata = createEnhancedMetadata(
      {
        fileId: decompressedFileId,
        fileName: decompressedFileName,
        filePath: decompressedFilePath,
        originalName: fileMetadata.originalFile?.name || fileMetadata.originalName,
        mimeType: fileMetadata.originalFile?.mimeType || fileMetadata.mimeType,
        originalSize: compressedSize,
      },
      "decompress",
      algorithm,
      result,
      fileMetadata.originalFile,
    )

    const decompressedMetadataPath = path.join("processed", `${decompressedFileId}.json`)
    fs.writeFileSync(decompressedMetadataPath, JSON.stringify(enhancedMetadata, null, 2))

    console.log(`Decompression completed: ${compressedSize} → ${decompressedSize} bytes`)

    let explanation
    if (algorithm === "jpeg") {
      explanation = `JPEG decompression converted your compressed image back to PNG format. The original image data has been restored.`
    } else {
      explanation = `Successfully decompressed your file using ${algorithm} algorithm. The original file has been restored as ${decompressedFileName} with the exact original extension.`
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
