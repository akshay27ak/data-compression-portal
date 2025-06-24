"use client"

import { downloadFile } from "../../services/api"
import { useState } from "react"

export default function DownloadSection({ result, fileName, fileId }) {
  const [isDownloading, setIsDownloading] = useState(false)

  const getDownloadFileName = () => {
    console.log(`🔍 DownloadSection Debug - Full result object:`, result)
    console.log(`🔍 result.fileName:`, result.fileName)
    console.log(`🔍 result.processedFile:`, result.processedFile)

    // PRIORITY 1: Use the filename from the backend result (this is the ACTUAL filename created!)
    if (result.fileName) {
      console.log(`✅ Using backend filename: ${result.fileName}`)
      return result.fileName
    }

    // PRIORITY 2: Use processedFile.name from result (backup)
    if (result.processedFile && result.processedFile.name) {
      console.log(`✅ Using processedFile name: ${result.processedFile.name}`)
      return result.processedFile.name
    }

    // PRIORITY 3: Only as absolute fallback - should never reach here if backend works correctly
    console.log(`⚠️ Backend filename not available, this should not happen!`)
    console.log(`⚠️ Available result keys:`, Object.keys(result))
    console.log(`⚠️ fileName prop:`, fileName)
    return fileName || "processed_file"
  }

  const getFileIcon = () => {
    const filename = getDownloadFileName()
    const ext = filename.split(".").pop()?.toLowerCase()

    switch (ext) {
      case "jpeg":
      case "jpg":
      case "png":
        return "🖼️"
      case "txt":
        return "📄"
      case "pdf":
        return "📕"
      case "bin":
        return "🗜️"
      default:
        return "📄"
    }
  }

  const getFileTypeDescription = () => {
    const filename = getDownloadFileName()
    const ext = filename.split(".").pop()?.toLowerCase()

    if (result.action === "compress") {
      if (result.algorithm === "jpeg") {
        return "Standard JPEG format"
      } else {
        return "Compressed binary format"
      }
    } else {
      // Decompression
      if (result.algorithm === "jpeg") {
        return "PNG format (lossless)"
      } else {
        switch (ext) {
          case "txt":
            return "Text file (restored)"
          case "bin":
            return "Binary file (restored)"
          case "png":
            return "PNG image (restored)"
          case "jpg":
          case "jpeg":
            return "JPEG image (restored)"
          default:
            return "Original format (restored)"
        }
      }
    }
  }

  const handleDownload = async () => {
    if (!fileId) {
      alert("No file available for download")
      return
    }

    setIsDownloading(true)

    try {
      const downloadFileName = getDownloadFileName()
      console.log(`📥 Starting download:`)
      console.log(`📥 - fileId: ${fileId}`)
      console.log(`📥 - downloadFileName: ${downloadFileName}`)
      console.log(`📥 - result.action: ${result.action}`)
      console.log(`📥 - result.algorithm: ${result.algorithm}`)

      await downloadFile(fileId, downloadFileName)
      console.log(`✅ Download completed successfully`)
    } catch (error) {
      console.error(`❌ Download failed:`, error)
      alert(`Download failed: ${error.message}`)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">💾</span>
          Download File
        </h3>
        <p className="text-gray-600 text-sm">Your processed file is ready for download</p>
      </div>

      <div className="space-y-4">
        {/* File Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{getFileIcon()}</span>
            <div>
              <p className="font-semibold text-gray-900">{getDownloadFileName()}</p>
              <p className="text-sm text-gray-500">
                {result.action === "compress" ? "Compressed" : "Decompressed"} file ({getFileTypeDescription()})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">File Size</p>
              <p className="font-medium text-gray-900">{(result.processedSize / 1024).toFixed(2)} KB</p>
            </div>
            <div>
              <p className="text-gray-500">Algorithm</p>
              <p className="font-medium text-gray-900 capitalize">{result.algorithm}</p>
            </div>
          </div>
        </div>

        {/* File Type Info */}
        {result.action === "compress" && result.algorithm === "jpeg" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">📸 JPEG File:</span> This .jpeg file can be opened in any image viewer or
              editor.
            </p>
          </div>
        )}

        {result.action === "decompress" && result.algorithm === "jpeg" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">🖼️ PNG File:</span> Decompressed to lossless PNG format for quality
              preservation.
            </p>
          </div>
        )}

        {result.action === "compress" && result.algorithm !== "jpeg" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">🗜️ Compressed File:</span> Upload this .bin file back to decompress and
              restore your original file.
            </p>
          </div>
        )}

        {result.action === "decompress" && result.algorithm !== "jpeg" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">📄 Restored File:</span> Your original file has been restored with the
              correct extension and can be opened normally.
            </p>
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isDownloading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 active:scale-95"
          }`}
        >
          {isDownloading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <span className="text-lg">⬇️</span>
              <span>Download {result.action === "compress" ? "Compressed" : "Decompressed"} File</span>
            </>
          )}
        </button>

        {/* Additional Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Process Another File
          </button>
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200">
            Share Results
          </button>
        </div>
      </div>
    </div>
  )
}
