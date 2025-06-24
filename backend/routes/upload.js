const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")
const { detectCompressedFile } = require("../utils/compressionDetector")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const fileId = uuidv4()
    const extension = path.extname(file.originalname)
    cb(null, `${fileId}${extension}`)
  },
})

const upload = multer({ storage: storage })

// ENHANCED: Find original compression metadata for compressed files
const findOriginalCompressionMetadata = (fileName) => {
  console.log(`🔍 Searching for original compression metadata for: ${fileName}`)

  // Check if this is our compressed file pattern
  if (!fileName.includes("_compressed_")) {
    console.log(`❌ Not a compressed file pattern`)
    return null
  }

  try {
    // Look through processed directory for matching compression metadata
    const processedDir = "processed"
    if (!fs.existsSync(processedDir)) {
      console.log(`❌ Processed directory doesn't exist`)
      return null
    }

    const files = fs.readdirSync(processedDir)
    const metadataFiles = files.filter((file) => file.endsWith(".json"))

    console.log(`🔍 Found ${metadataFiles.length} metadata files to check`)

    for (const metadataFile of metadataFiles) {
      try {
        const metadataPath = path.join(processedDir, metadataFile)
        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"))

        // Check if this metadata is for a compression action and matches our file
        if (metadata.action === "compress" && metadata.processedFile) {
          const processedFileName = path.basename(metadata.processedFile.name)
          console.log(`🔍 Checking: ${processedFileName} vs ${fileName}`)

          if (processedFileName === fileName) {
            console.log(`✅ Found matching compression metadata!`)
            return metadata
          }
        }
      } catch (err) {
        console.log(`⚠️ Error reading metadata file ${metadataFile}:`, err.message)
        continue
      }
    }

    console.log(`❌ No matching compression metadata found`)
    return null
  } catch (error) {
    console.log(`❌ Error searching for compression metadata:`, error.message)
    return null
  }
}

router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const fileId = path.parse(req.file.filename).name
    const originalName = req.file.originalname
    const filePath = req.file.path
    const fileSize = req.file.size
    const mimeType = req.file.mimetype

    console.log(`📤 File uploaded: ${originalName} (${fileSize} bytes, ${mimeType})`)

    // Detect if this is a compressed file
    const compressionInfo = detectCompressedFile(filePath, originalName)
    console.log(`🔍 Compression detection result:`, compressionInfo)

    const fileMetadata = {
      fileId: fileId,
      originalName: originalName,
      fileName: req.file.filename,
      originalSize: fileSize,
      mimeType: mimeType,
      uploadTime: new Date().toISOString(),
      filePath: filePath,
      fileStatus: {
        isCompressed: compressionInfo.isCompressed,
        algorithm: compressionInfo.algorithm,
        type: compressionInfo.isCompressed ? "system" : "original",
      },
      isCompressed: compressionInfo.isCompressed,
      detectedAlgorithm: compressionInfo.algorithm,
      compressionType: compressionInfo.isCompressed ? "system" : "original",
    }

    // ENHANCED: If this is a compressed file, try to find original compression metadata
    if (compressionInfo.isCompressed) {
      console.log(`🗜️ Compressed file detected, searching for original metadata...`)

      const originalCompressionMetadata = findOriginalCompressionMetadata(originalName)

      if (originalCompressionMetadata && originalCompressionMetadata.compressionMetadata) {
        console.log(`✅ Found original compression metadata!`)

        // Use the ORIGINAL file metadata from when it was first compressed
        fileMetadata.originalFileMetadata = {
          extension: originalCompressionMetadata.compressionMetadata.originalExtension,
          baseName: originalCompressionMetadata.compressionMetadata.originalBaseName,
          mimeType: originalCompressionMetadata.compressionMetadata.originalMimeType,
          fullName: originalCompressionMetadata.compressionMetadata.originalFullName,
        }

        // Store reference to original compression metadata
        fileMetadata.linkedCompressionMetadata = {
          fileId: originalCompressionMetadata.fileId,
          originalFile: originalCompressionMetadata.originalFile,
          compressionMetadata: originalCompressionMetadata.compressionMetadata,
        }

        console.log(`📋 Using original file metadata:`, fileMetadata.originalFileMetadata)
      } else {
        console.log(`⚠️ No original compression metadata found, using filename extraction`)

        // Fallback: extract from filename pattern
        if (originalName.includes("_compressed_")) {
          const beforeCompressed = originalName.split("_compressed_")[0]
          const lastDotIndex = beforeCompressed.lastIndexOf(".")

          if (lastDotIndex !== -1) {
            const originalExt = beforeCompressed.substring(lastDotIndex)
            const originalBase = beforeCompressed.substring(0, lastDotIndex)

            fileMetadata.originalFileMetadata = {
              extension: originalExt,
              baseName: originalBase,
              mimeType:
                originalExt === ".txt"
                  ? "text/plain"
                  : originalExt === ".bin"
                    ? "application/octet-stream"
                    : "application/octet-stream",
              fullName: beforeCompressed,
            }
          } else {
            // Default fallback
            fileMetadata.originalFileMetadata = {
              extension: ".bin",
              baseName: beforeCompressed,
              mimeType: "application/octet-stream",
              fullName: beforeCompressed,
            }
          }
        } else {
          // Default for compressed files
          fileMetadata.originalFileMetadata = {
            extension: compressionInfo.originalExt || ".bin",
            baseName: path.parse(originalName).name,
            mimeType: "application/octet-stream",
            fullName: originalName,
          }
        }
      }
    } else {
      // For original (non-compressed) files
      fileMetadata.originalFileMetadata = {
        extension: path.extname(originalName),
        baseName: path.parse(originalName).name,
        mimeType: mimeType,
        fullName: originalName,
      }
    }

    // Save metadata
    const metadataPath = path.join("uploads", `${fileId}.json`)
    fs.writeFileSync(metadataPath, JSON.stringify(fileMetadata, null, 2))

    console.log(`✅ File uploaded successfully: ${fileId}`)
    console.log(`📋 Final metadata:`, fileMetadata)

    res.json({
      fileId: fileId,
      originalName: originalName,
      size: fileSize,
      mimeType: mimeType,
      isCompressed: compressionInfo.isCompressed,
      detectedAlgorithm: compressionInfo.algorithm,
      compressionType: compressionInfo.isCompressed ? "system" : "original",
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({
      message: "Upload failed",
      error: error.message,
    })
  }
})

module.exports = router
