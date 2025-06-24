const express = require("express")
const path = require("path")
const fs = require("fs")

const router = express.Router()

router.get("/:fileId", (req, res) => {
  try {
    const { fileId } = req.params

    if (!fileId) {
      return res.status(400).json({
        message: "File ID is required",
      })
    }

    let metadataPath = path.join("processed", `${fileId}.json`)
    let isProcessedFile = true

    if (!fs.existsSync(metadataPath)) {
      metadataPath = path.join("uploads", `${fileId}.json`)
      isProcessedFile = false
    }

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({
        message: "File not found",
      })
    }

    const fileMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"))

    const fileInfo = {
      fileId: fileMetadata.fileId,
      fileName: fileMetadata.originalName || fileMetadata.fileName,
      size: fileMetadata.originalSize || fileMetadata.processedSize,
      type: fileMetadata.mimeType || "application/octet-stream",
      uploadTime: fileMetadata.uploadTime || fileMetadata.timestamp,
      isProcessed: isProcessedFile,
    }

    if (isProcessedFile) {
      fileInfo.algorithm = fileMetadata.algorithm
      fileInfo.action = fileMetadata.action
      fileInfo.processingTime = fileMetadata.processingTime
      if (fileMetadata.compressionRatio) {
        fileInfo.compressionRatio = fileMetadata.compressionRatio
      }
    }

    res.json(fileInfo)
  } catch (error) {
    console.error("File info error:", error)
    res.status(500).json({
      message: "Failed to get file information",
      error: error.message,
    })
  }
})

module.exports = router
