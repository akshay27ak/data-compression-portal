"use client"

import { useState } from "react"
import { algorithms } from "../../data/algorithmsData"

export default function AlgorithmSelection({
  selectedAlgorithm,
  onAlgorithmChange,
  autoSuggest,
  onAutoSuggestChange,
  detectedFileType,
}) {
  const [showTooltip, setShowTooltip] = useState(null)

  const getRecommendedAlgorithm = (fileType) => {
    switch (fileType) {
      case "text":
        return "huffman"
      case "image":
        return "jpeg" // Changed from "rle" to "jpeg" for images
      case "binary":
        return "lz77"
      default:
        return "huffman"
    }
  }

  const selectedAlgo = algorithms.find((algo) => algo.id === selectedAlgorithm)
  const recommendedAlgorithm = detectedFileType ? getRecommendedAlgorithm(detectedFileType) : null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <span className="text-xl">🧮</span>
          Algorithm Selection
        </h3>
        <p className="text-gray-600 text-sm">Choose compression algorithm or let us suggest one</p>
      </div>

      {/* Auto-suggest Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoSuggest}
            onChange={(e) => onAutoSuggestChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900">Auto-suggest algorithm</span>
            <p className="text-sm text-gray-500">Automatically pick the best algorithm based on file type</p>
          </div>
        </label>
      </div>

      {/* Recommendation Banner */}
      {autoSuggest && recommendedAlgorithm && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">💡</span>
            <span className="text-sm font-medium text-blue-800">
              Recommended: {algorithms.find((a) => a.id === recommendedAlgorithm)?.name} for {detectedFileType} files
            </span>
          </div>
        </div>
      )}

      {/* Algorithm Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Compression Algorithm</label>
        <select
          value={selectedAlgorithm}
          onChange={(e) => onAlgorithmChange(e.target.value)}
          disabled={autoSuggest}
          className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            autoSuggest ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
          }`}
        >
          {algorithms.map((algorithm) => (
            <option key={algorithm.id} value={algorithm.id}>
              {algorithm.name} - {algorithm.efficiency} efficiency ({algorithm.type})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Algorithm Info */}
      {selectedAlgo && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{selectedAlgo.name}</h4>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedAlgo.type === "lossless" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                }`}
              >
                {selectedAlgo.type.toUpperCase()}
              </span>
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTooltip(selectedAlgorithm)}
                  onMouseLeave={() => setShowTooltip(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {showTooltip === selectedAlgorithm && (
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    <p className="mb-2 font-medium">{selectedAlgo.name}</p>
                    <p>{selectedAlgo.description}</p>
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3">{selectedAlgo.description}</p>

          {/* Lossy Warning for JPEG */}
          {selectedAlgo.type === "lossy" && (
            <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-orange-600">⚠️</span>
                <span className="text-xs font-medium text-orange-800">
                  Lossy Compression: Some image quality will be lost but file size will be significantly reduced
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center p-2 bg-white rounded">
              <p className="text-gray-500">Efficiency</p>
              <p className="font-semibold text-gray-900">{selectedAlgo.efficiency}</p>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <p className="text-gray-500">Speed</p>
              <p className="font-semibold text-gray-900">{selectedAlgo.speed}</p>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <p className="text-gray-500">Ratio</p>
              <p className="font-semibold text-gray-900">{selectedAlgo.compressionRatio}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
