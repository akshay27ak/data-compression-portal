"use client"

import { downloadFile } from "../../services/api"
import { useState } from "react"

export default function DownloadSection({ result, fileName, fileId }) {
  const [isDownloading, setIsDownloading] = useState(false)

  const getDownloadFileName = () => {
    // Use the filename from the result if available
    if (result.fileName) {
      return result.fileName
    }

    // Fallback to generating filename
    if (!fileName) return "processed_file"

    const nameWithoutExt = fileName.split(".").slice(0, -1).join(".")
    const extension =
      result.action === "compress"
        ? result.algorithm === "jpeg"
          ? "jpeg"
          : "bin"
        : result.algorithm === "jpeg"
          ? "png"
          : fileName.split(".").pop()

    return `${nameWithoutExt}_${result.action}ed_${result.algorithm}.${extension}`
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

  const handleDownload = async () => {
    if (!fileId) {
      alert("No file available for download")
      return
    }

    setIsDownloading(true)

    try {
      await downloadFile(fileId, getDownloadFileName())
    } catch (error) {
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
                {result.action === "compress" ? "Compressed" : "Decompressed"} file
                {result.algorithm === "jpeg" && result.action === "compress" && " (Standard JPEG format)"}
                {result.algorithm === "jpeg" && result.action === "decompress" && " (PNG format)"}
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
        {result.algorithm === "jpeg" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              {result.action === "compress" ? (
                <>
                  <span className="font-medium">📸 JPEG File:</span> This .jpeg file can be opened in any image viewer
                  or editor.
                </>
              ) : (
                <>
                  <span className="font-medium">🖼️ PNG File:</span> Decompressed to lossless PNG format for quality
                  preservation.
                </>
              )}
            </p>
          </div>
        )}

        {result.algorithm !== "jpeg" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              {result.action === "compress" ? (
                <>
                  <span className="font-medium">🗜️ Compressed File:</span> Upload this .bin file back to decompress and
                  restore your original file.
                </>
              ) : (
                <>
                  <span className="font-medium">📄 Restored File:</span> Your original file has been restored with the
                  correct extension.
                </>
              )}
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
