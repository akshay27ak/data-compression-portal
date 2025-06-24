"use client"

import { useState, useRef } from "react"

export default function FileUpload({ onFileSelect, selectedFile, fileStatus }) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0])
    }
  }

  const getFileIcon = (file) => {
    if (!file) return "📁"
    if (file.type.startsWith("text/")) return "📄"
    if (file.type.startsWith("image/")) return "🖼️"
    if (file.type.startsWith("binary/")) return "💾"
    return "📄"
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFilePreview = (file) => {
    if (file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file)
      return (
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Preview"
          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
          onLoad={() => URL.revokeObjectURL(imageUrl)}
        />
      )
    }

    if (file.type.startsWith("text/")) {
      return (
        <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
          <span className="text-2xl">📄</span>
        </div>
      )
    }

    return (
      <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-2xl">{getFileIcon(file)}</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <span className="text-2xl">📤</span>
          Upload File
        </h2>
        <p className="text-gray-600">Select a file to compress or decompress using various algorithms</p>
      </div>

      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${
            dragActive
              ? "border-blue-400 bg-blue-50 scale-105"
              : selectedFile
                ? fileStatus?.isCompressed
                  ? "border-purple-400 bg-purple-50"
                  : "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" accept="*/*" />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              {getFilePreview(selectedFile)}
              <div className="text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-lg truncate">{selectedFile.name}</p>
                  {fileStatus?.isCompressed && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full font-medium">
                      🗜️ COMPRESSED
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || "Unknown type"}
                </p>
                {fileStatus?.isCompressed && (
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    Algorithm: {fileStatus.detectedAlgorithm?.toUpperCase()}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Last modified: {new Date(selectedFile.lastModified).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* File Status Banner */}
            {fileStatus?.isCompressed ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">🗜️</span>
                  <div>
                    <p className="text-sm font-medium text-purple-800">Compressed File Detected</p>
                    <p className="text-xs text-purple-600">
                      This file was compressed using {fileStatus.detectedAlgorithm?.toUpperCase()} algorithm. Use
                      decompress to restore the original file.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">📄</span>
                  <div>
                    <p className="text-sm font-medium text-green-800">Original File</p>
                    <p className="text-xs text-green-600">
                      This is an uncompressed file. You can compress it using any available algorithm.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Choose Different File
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFileSelect(null)
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Remove File
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <span className="text-6xl block">📤</span>
            <div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-sm text-gray-500">Supports all file types • Maximum file size: 100MB</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200">
              Browse Files
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
