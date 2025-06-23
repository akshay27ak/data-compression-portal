const express = require("express")
const multer = require("multer")
const path = require("path")
const { v4: uuidv4 } = require("uuid")
const fs = require("fs")
const { detectCompressedFile } = require("../utils/compressionDetector")

const router = express.Router()

// Enhanced file detection
const detectFileStatus = (file, filePath) => {
  const fileName = file.originalname

  // Check for our compressed file patterns
  if (fileName.includes("_compressed_huffman.bin")) {
    return { isCompressed: true, algorithm: "huffman", type: "system" }
  }
  if (fileName.includes("_compressed_rle.bin")) {
    return { isCompressed: true, algorithm: "rle", type: "system" }
  }
  if (fileName.includes("_compressed_lz77.bin")) {
    return { isCompressed: true, algorithm: "lz77", type: "system" }
  }

  // Check for JPEG files (potentially compressed)
  if (file.mimetype === "image/jpeg" || fileName.toLowerCase().match(/\.(jpg|jpeg)$/)) {
    return { isCompressed: true, algorithm: "jpeg", type: "standard" }
  }

  // Use the utility function for more detailed detection
  const detectionResult = detectCompressedFile(filePath, fileName)
  if (detectionResult.isCompressed) {
    return {
      isCompressed: true,
      algorithm: detectionResult.algorithm,
      type: "detected",
      originalExt: detectionResult.originalExt,
    }
  }

  return { isCompressed: false, algorithm: null, type: "original" }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const fileId = uuidv4()
    const extension = path.extname(file.originalname)
    cb(null, `${fileId}${extension}`)
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types
    cb(null, true)
  },
})

// Enhanced file upload endpoint
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      })
    }

    // Detect file status after file is saved
    const fileStatus = detectFileStatus(req.file, req.file.path)

    const fileInfo = {
      fileId: path.parse(req.file.filename).name,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      originalSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadTime: new Date().toISOString(),
      filePath: req.file.path,

      // Enhanced file status information
      fileStatus: fileStatus,
      isCompressed: fileStatus.isCompressed,
      detectedAlgorithm: fileStatus.algorithm,
      compressionType: fileStatus.type,
      originalExtension: fileStatus.originalExt,
    }

    // Store enhanced file metadata
    const metadataPath = path.join("uploads", `${fileInfo.fileId}.json`)
    fs.writeFileSync(metadataPath, JSON.stringify(fileInfo, null, 2))

    console.log(
      `📤 File uploaded: ${req.file.originalname} (${req.file.size} bytes) - ${fileStatus.isCompressed ? `COMPRESSED (${fileStatus.algorithm})` : "ORIGINAL"}`,
    )

    res.json({
      fileId: fileInfo.fileId,
      originalSize: fileInfo.originalSize,
      fileName: fileInfo.originalName,
      mimeType: fileInfo.mimeType,
      isCompressed: fileStatus.isCompressed,
      detectedAlgorithm: fileStatus.algorithm,
      compressionType: fileStatus.type,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({
      message: "File upload failed",
      error: error.message,
    })
  }
})

module.exports = router
