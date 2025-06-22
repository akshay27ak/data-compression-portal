const express = require("express")
const path = require("path")
const fs = require("fs")

const router = express.Router()

// File download endpoint
router.get("/:fileId", (req, res) => {
  try {
    const { fileId } = req.params

    if (!fileId) {
      return res.status(400).json({
        message: "File ID is required",
      })
    }

    // Check in processed files first
    let metadataPath = path.join("processed", `${fileId}.json`)
    let isProcessedFile = true

    if (!fs.existsSync(metadataPath)) {
      // Check in uploads
      metadataPath = path.join("uploads", `${fileId}.json`)
      isProcessedFile = false
    }

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({
        message: "File not found",
      })
    }

    const fileMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    const filePath = fileMetadata.filePath

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "File data not found",
      })
    }

    // Determine filename for download
    let downloadFileName
    if (isProcessedFile) {
      const originalName = fileMetadata.originalName || "processed_file"
      const nameWithoutExt = path.parse(originalName).name
      const action = fileMetadata.action || "processed"
      const algorithm = fileMetadata.algorithm || "unknown"
      downloadFileName = `${nameWithoutExt}_${action}_${algorithm}.bin`
    } else {
      downloadFileName = fileMetadata.originalName || fileMetadata.fileName
    }

    console.log(
      `📥 Downloading file: ${downloadFileName} (${fileMetadata.originalSize || fileMetadata.processedSize} bytes)`,
    )

    // Set appropriate headers
    res.setHeader("Content-Disposition", `attachment; filename="${downloadFileName}"`)
    res.setHeader("Content-Type", "application/octet-stream")
    res.setHeader("Content-Length", fs.statSync(filePath).size)

    // Stream the file
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)

    fileStream.on("error", (error) => {
      console.error("Download stream error:", error)
      if (!res.headersSent) {
        res.status(500).json({
          message: "Error streaming file",
        })
      }
    })
  } catch (error) {
    console.error("Download error:", error)
    res.status(500).json({
      message: "Download failed",
      error: error.message,
    })
  }
})

module.exports = router
