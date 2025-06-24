"use client"

export default function ActionButtons({
  onCompress,
  onDecompress,
  isProcessing,
  processingAction,
  disabled,
  selectedAlgorithm,
  fileStatus,
  hasFile, 
}) {
  const canCompress = !fileStatus?.isCompressed && !disabled
  const canDecompress = fileStatus?.isCompressed && !disabled

  const getButtonText = (action) => {
    if (isProcessing && processingAction === action) {
      switch (processingAction) {
        case "upload":
          return "Uploading..."
        case "compress":
          return "Compressing..."
        case "decompress":
          return "Decompressing..."
        default:
          return "Processing..."
      }
    }
    return action === "compress" ? "Compress File" : "Decompress File"
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          Actions
        </h3>
        <p className="text-gray-600 text-sm">
          {fileStatus?.isCompressed
            ? "This file is already compressed - use decompress to restore original"
            : "Choose to compress your file using the selected algorithm"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onCompress}
          disabled={!canCompress || isProcessing}
          className={`
            flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-semibold transition-all duration-200
            ${
              !canCompress || isProcessing
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95"
            }
          `}
        >
          {isProcessing && processingAction === "compress" ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Compressing...</span>
            </>
          ) : (
            <>
              <span className="text-lg">🗜️</span>
              <span>Compress File</span>
            </>
          )}
        </button>

        <button
          onClick={onDecompress}
          disabled={!canDecompress || isProcessing}
          className={`
            flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-semibold transition-all duration-200
            ${
              !canDecompress || isProcessing
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 active:scale-95"
            }
          `}
        >
          {isProcessing && processingAction === "decompress" ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Decompressing...</span>
            </>
          ) : (
            <>
              <span className="text-lg">📦</span>
              <span>Decompress File</span>
            </>
          )}
        </button>
      </div>

      {/* Status Messages - ONLY show when file is uploaded */}
      {hasFile && fileStatus?.isCompressed ? (
        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-purple-600">🗜️</span>
            <div>
              <p className="text-sm font-medium text-purple-800">Compressed File Detected</p>
              <p className="text-xs text-purple-600">
                Algorithm: {fileStatus.detectedAlgorithm?.toUpperCase()} • Only decompression is available for this file
              </p>
            </div>
          </div>
        </div>
      ) : hasFile && !fileStatus?.isCompressed ? (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-600">📄</span>
            <div>
              <p className="text-sm font-medium text-green-800">Original File Ready</p>
              <p className="text-xs text-green-600">
                This file can be compressed using {selectedAlgorithm?.toUpperCase()} algorithm
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {disabled && (
        <p className="text-center text-sm text-gray-500 mt-3">
          {isProcessing && processingAction === "upload"
            ? "Uploading file to server..."
            : "Please upload a file to enable compression/decompression"}
        </p>
      )}
    </div>
  )
}
