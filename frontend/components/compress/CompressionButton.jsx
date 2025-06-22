"use client"

export default function CompressionButton({ onCompress, isProcessing }) {
  return (
    <button
      onClick={onCompress}
      disabled={isProcessing}
      className={`
        w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 transform
        ${
          isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gray-600 hover:bg-gray-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300 active:scale-95"
        }
      `}
    >
      {isProcessing ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg">🗜️</span>
          <span>Compress File</span>
        </div>
      )}
    </button>
  )
}
