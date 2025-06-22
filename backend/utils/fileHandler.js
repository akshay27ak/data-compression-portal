const fs = require("fs")
const path = require("path")

/**
 * Clean up old files to prevent disk space issues
 */
function cleanupOldFiles() {
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  const now = Date.now()

  const directories = ["uploads", "processed"]

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) return

    const files = fs.readdirSync(dir)
    let cleanedCount = 0

    files.forEach((file) => {
      const filePath = path.join(dir, file)
      const stats = fs.statSync(filePath)

      if (now - stats.mtime.getTime() > maxAge) {
        try {
          fs.unlinkSync(filePath)
          cleanedCount++
        } catch (error) {
          console.error(`Error deleting old file ${filePath}:`, error.message)
        }
      }
    })

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old files from ${dir}/`)
    }
  })
}

/**
 * Get file size in human readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Validate file type and size
 */
function validateFile(file) {
  const maxSize = 100 * 1024 * 1024 // 100MB

  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size is ${formatFileSize(maxSize)}`)
  }

  return true
}

/**
 * Get file type from MIME type
 */
function getFileType(mimeType) {
  if (!mimeType) return "binary"

  if (mimeType.startsWith("text/")) return "text"
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType.startsWith("audio/")) return "audio"

  return "binary"
}

module.exports = {
  cleanupOldFiles,
  formatFileSize,
  validateFile,
  getFileType,
}
