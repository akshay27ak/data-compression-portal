"use client"

export default function ActionButtons({
  onCompress,
  onDecompress,
  isProcessing,
  processingAction,
  disabled,
  selectedAlgorithm,
}) {
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
        <p className="text-gray-600 text-sm">Choose to compress or decompress your file</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onCompress}
          disabled={disabled || isProcessing}
          className={`
            flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-semibold transition-all duration-200
            ${
              disabled || isProcessing
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95"
            }
          `}
        >
          {isProcessing && processingAction === "compress" ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{getButtonText("compress")}</span>
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
          disabled={disabled || isProcessing}
          className={`
            flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-semibold transition-all duration-200
            ${
              disabled || isProcessing
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 active:scale-95"
            }
          `}
        >
          {isProcessing && processingAction === "decompress" ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{getButtonText("decompress")}</span>
            </>
          ) : (
            <>
              <span className="text-lg">📦</span>
              <span>Decompress File</span>
            </>
          )}
        </button>
      </div>

      {disabled && (
        <p className="text-center text-sm text-gray-500 mt-3">
          {isProcessing && processingAction === "upload"
            ? "Uploading file to server..."
            : "Please upload a file to enable compression/decompression"}
        </p>
      )}

      {selectedAlgorithm === "jpeg" && !disabled && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-center text-sm text-blue-800">
            <span className="font-medium">JPEG:</span> Compression creates .jpeg files. Decompression converts to .png
            format.
          </p>
        </div>
      )}
    </div>
  )
}
