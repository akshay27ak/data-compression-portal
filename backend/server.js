const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const path = require("path")
require("dotenv").config()

const uploadRoutes = require("./routes/upload")
const compressRoutes = require("./routes/compress")
const downloadRoutes = require("./routes/download")
const fileRoutes = require("./routes/file")

const { cleanupOldFiles } = require("./utils/fileHandler")

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(compression())

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://data-compression-portal-tawny.vercel.app",
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.netlify\.app$/,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({ extended: true, limit: "100mb" }))

const fs = require("fs")
const uploadsDir = path.join(__dirname, "uploads")
const processedDir = path.join(__dirname, "processed")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true })
}

app.use("/upload", uploadRoutes)
app.use("/compress", compressRoutes)
app.use("/decompress", compressRoutes)
app.use("/download", downloadRoutes)
app.use("/file", fileRoutes)

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    algorithms: ["huffman", "rle", "lz77", "jpeg"],
  })
})

app.get("/", (req, res) => {
  res.json({
    message: "File Compression & Decompression API",
    version: "1.5.0",
    endpoints: {
      upload: "POST /upload",
      compress: "POST /compress",
      decompress: "POST /decompress",
      download: "GET /download/:fileId",
      health: "GET /health",
    },
    algorithms: ["huffman", "rle", "lz77", "jpeg"],
    features: {
      jpeg: "Creates .jpg files with industry-standard compression",
      decompression: "Available for all algorithms including JPEG (converts to PNG)",
      lossless: "Huffman, RLE, LZ77 provide perfect reconstruction",
      lossy: "JPEG optimized for photographic images",
    },
  })
})

app.use((err, req, res, next) => {
  console.error("Error:", err)

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "File too large. Maximum size is 100MB.",
    })
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      message: "Unexpected file field.",
    })
  }

  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

app.use("*", (req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
    availableEndpoints: ["/upload", "/compress", "/decompress", "/download/:fileId", "/health"],
  })
})

setInterval(
  () => {
    cleanupOldFiles()
  },
  60 * 60 * 1000,
)

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully")
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`Compression API Server running on port ${PORT}`)
  console.log(`Uploads directory: ${uploadsDir}`)
  console.log(`Processed files directory: ${processedDir}`)
})

module.exports = app
