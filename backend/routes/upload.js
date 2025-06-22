const express = require("express")
const multer = require("multer")
const path = require("path")
const { v4: uuidv4 } = require("uuid")
const fs = require("fs")

const router = express.Router()

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

// File upload endpoint
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      })
    }

    const fileInfo = {
      fileId: path.parse(req.file.filename).name,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      originalSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadTime: new Date().toISOString(),
      filePath: req.file.path,
    }

    // Store file metadata
    const metadataPath = path.join("uploads", `${fileInfo.fileId}.json`)
    fs.writeFileSync(metadataPath, JSON.stringify(fileInfo, null, 2))

    console.log(`📤 File uploaded: ${req.file.originalname} (${req.file.size} bytes)`)

    res.json({
      fileId: fileInfo.fileId,
      originalSize: fileInfo.originalSize,
      fileName: fileInfo.originalName,
      mimeType: fileInfo.mimeType,
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
