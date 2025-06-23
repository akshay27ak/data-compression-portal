const express = require("express")
const path = require("path")
const fs = require("fs")

const router = express.Router()

// Download endpoint with enhanced file handling
router.get("/:fileId", (req, res) => {
  try {
    const { fileId } = req.params
    const { filename } = req.query

    if (!fileId) {
      return res.status(400).json({
        message: "File ID is required",
      })
    }

    // Check both uploads and processed directories for metadata
    let metadataPath = path.join("uploads", `${fileId}.json`)
    let isFromProcessed = false

    if (!fs.existsSync(metadataPath)) {
      metadataPath = path.join("processed", `${fileId}.json`)
      isFromProcessed = true
    }

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({
        message: "File not found",
      })
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"))

    // Get the actual file path
    let filePath
    if (isFromProcessed) {
      filePath = metadata.filePath || metadata.processedFile?.path
    } else {
      filePath = metadata.filePath
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Physical file not found",
      })
    }

    // Determine the download filename
    let downloadFilename
    if (filename) {
      // Use the filename provided by the frontend (from backend response)
      downloadFilename = filename
    } else if (isFromProcessed && metadata.processedFile?.name) {
      // Use the processed file name from metadata
      downloadFilename = metadata.processedFile.name
    } else {
      // Fallback to original name or generic name
      downloadFilename = metadata.originalName || metadata.fileName || "download"
    }

    console.log(`📥 Downloading file: ${downloadFilename} from ${filePath}`)

    // Set proper headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${downloadFilename}"`)

    // Set content type based on file extension
    const ext = path.extname(downloadFilename).toLowerCase()
    switch (ext) {
      case ".txt":
        res.setHeader("Content-Type", "text/plain")
        break
      case ".jpeg":
      case ".jpg":
        res.setHeader("Content-Type", "image/jpeg")
        break
      case ".png":
        res.setHeader("Content-Type", "image/png")
        break
      case ".bin":
        res.setHeader("Content-Type", "application/octet-stream")
        break
      default:
        res.setHeader("Content-Type", "application/octet-stream")
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)

    fileStream.on("error", (error) => {
      console.error("File stream error:", error)
      if (!res.headersSent) {
        res.status(500).json({
          message: "Error reading file",
          error: error.message,
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
