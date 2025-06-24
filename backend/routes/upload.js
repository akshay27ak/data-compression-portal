const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")
const { detectCompressedFile } = require("../utils/compressionDetector")

const router = express.Router()

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

const findOriginalCompressionMetadata = (fileName) => {

  if (!fileName.includes("_compressed_")) {
    return null
  }

  try {
    const processedDir = "processed"
    if (!fs.existsSync(processedDir)) {
      return null
    }

    const files = fs.readdirSync(processedDir)
    const metadataFiles = files.filter((file) => file.endsWith(".json"))


    for (const metadataFile of metadataFiles) {
      try {
        const metadataPath = path.join(processedDir, metadataFile)
        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"))

        if (metadata.action === "compress" && metadata.processedFile) {
          const processedFileName = path.basename(metadata.processedFile.name)

          if (processedFileName === fileName) {
            return metadata
          }
        }
      } catch (err) {
        console.log(`Error reading metadata file ${metadataFile}:`, err.message)
        continue
      }
    }

    return null
  } catch (error) {
    console.log(`Error searching for compression metadata:`, error.message)
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

    console.log(`File uploaded: ${originalName} (${fileSize} bytes, ${mimeType})`)

    const compressionInfo = detectCompressedFile(filePath, originalName)

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

    if (compressionInfo.isCompressed) {

      const originalCompressionMetadata = findOriginalCompressionMetadata(originalName)

      if (originalCompressionMetadata && originalCompressionMetadata.compressionMetadata) {

        fileMetadata.originalFileMetadata = {
          extension: originalCompressionMetadata.compressionMetadata.originalExtension,
          baseName: originalCompressionMetadata.compressionMetadata.originalBaseName,
          mimeType: originalCompressionMetadata.compressionMetadata.originalMimeType,
          fullName: originalCompressionMetadata.compressionMetadata.originalFullName,
        }

        fileMetadata.linkedCompressionMetadata = {
          fileId: originalCompressionMetadata.fileId,
          originalFile: originalCompressionMetadata.originalFile,
          compressionMetadata: originalCompressionMetadata.compressionMetadata,
        }

      } else {

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
            fileMetadata.originalFileMetadata = {
              extension: ".bin",
              baseName: beforeCompressed,
              mimeType: "application/octet-stream",
              fullName: beforeCompressed,
            }
          }
        } else {
          fileMetadata.originalFileMetadata = {
            extension: compressionInfo.originalExt || ".bin",
            baseName: path.parse(originalName).name,
            mimeType: "application/octet-stream",
            fullName: originalName,
          }
        }
      }
    } else {
      fileMetadata.originalFileMetadata = {
        extension: path.extname(originalName),
        baseName: path.parse(originalName).name,
        mimeType: mimeType,
        fullName: originalName,
      }
    }

    const metadataPath = path.join("uploads", `${fileId}.json`)
    fs.writeFileSync(metadataPath, JSON.stringify(fileMetadata, null, 2))


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
