"use client"

export default function CompressionResult({ result }) {
  const formatFileSize = (bytes) => {
    if (bytes === 0 || isNaN(bytes) || bytes === undefined) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getCompressionRatio = () => {
    if (!result.originalSize || !result.processedSize || isNaN(result.originalSize) || isNaN(result.processedSize)) {
      return "0.0"
    }

    if (result.action === "compress") {
      return (((result.originalSize - result.processedSize) / result.originalSize) * 100).toFixed(1)
    } else {
      // For decompression, show expansion ratio
      return (((result.processedSize - result.originalSize) / result.originalSize) * 100).toFixed(1)
    }
  }

  const getSizeChange = () => {
    const ratio = getCompressionRatio()
    if (result.action === "compress") {
      return `${ratio}% smaller`
    } else {
      return `${ratio}% larger`
    }
  }

  const getEfficiencyRating = () => {
    const ratio = Number.parseFloat(getCompressionRatio())
    if (isNaN(ratio)) return { label: "Unknown", color: "gray", icon: "❓" }

    if (result.action === "compress") {
      if (ratio >= 70) return { label: "Excellent", color: "green", icon: "🏆" }
      if (ratio >= 50) return { label: "Very Good", color: "blue", icon: "⭐" }
      if (ratio >= 30) return { label: "Good", color: "yellow", icon: "👍" }
      if (ratio >= 15) return { label: "Fair", color: "orange", icon: "👌" }
      return { label: "Poor", color: "red", icon: "⚠️" }
    } else {
      // For decompression, success is just completing without errors
      return { label: "Success", color: "green", icon: "✅" }
    }
  }

  const efficiency = getEfficiencyRating()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">📊</span>
          {result.action === "compress" ? "Compression" : "Decompression"} Results
        </h3>
        <p className="text-gray-600 text-sm">Processing completed successfully</p>
      </div>

      <div className="space-y-4">
        {/* Size Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-600 font-medium mb-1">
              {result.action === "compress" ? "ORIGINAL SIZE" : "COMPRESSED SIZE"}
            </p>
            <p className="text-lg font-bold text-blue-800">{formatFileSize(result.originalSize)}</p>
          </div>
          <div
            className={`rounded-lg p-4 text-center ${result.action === "compress" ? "bg-green-50" : "bg-orange-50"}`}
          >
            <p
              className={`text-xs font-medium mb-1 ${
                result.action === "compress" ? "text-green-600" : "text-orange-600"
              }`}
            >
              {result.action === "compress" ? "COMPRESSED SIZE" : "DECOMPRESSED SIZE"}
            </p>
            <p className={`text-lg font-bold ${result.action === "compress" ? "text-green-800" : "text-orange-800"}`}>
              {formatFileSize(result.processedSize)}
            </p>
          </div>
        </div>

        {/* Compression Ratio & Efficiency */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-xs text-purple-600 font-medium mb-1">SIZE CHANGE</p>
            <p className="text-xl font-bold text-purple-800">{getSizeChange()}</p>
          </div>
          <div className={`bg-${efficiency.color}-50 rounded-lg p-4 text-center`}>
            <p className={`text-xs text-${efficiency.color}-600 font-medium mb-1`}>EFFICIENCY</p>
            <p className={`text-lg font-bold text-${efficiency.color}-800 flex items-center justify-center gap-1`}>
              <span>{efficiency.icon}</span>
              <span>{efficiency.label}</span>
            </p>
          </div>
        </div>

        {/* Algorithm Performance Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>🧮</span>
            Algorithm Performance Analysis
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-gray-500 mb-1">
                {result.action === "compress" ? "Compression Ratio" : "Expansion Ratio"}
              </p>
              <p className="font-bold text-gray-900">{getCompressionRatio()}%</p>
              <p className="text-xs text-gray-400 mt-1">
                {result.action === "compress" ? "Space Saved" : "Size Increase"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-gray-500 mb-1">Algorithm Used</p>
              <p className="font-bold text-gray-900 capitalize">{result.algorithm}</p>
              <p className="text-xs text-gray-400 mt-1">{result.algorithmType} Compression</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-gray-500 mb-1">Processing Speed</p>
              <p className="font-bold text-gray-900">{result.timeTaken || "0.00"}s</p>
              <p className="text-xs text-gray-400 mt-1">
                {result.originalSize && result.timeTaken && !isNaN(result.originalSize) && !isNaN(result.timeTaken)
                  ? `${(result.originalSize / 1024 / Number.parseFloat(result.timeTaken || 1)).toFixed(0)} KB/s`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Algorithm Efficiency Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <span>💡</span>
            {result.action === "compress" ? "Compression" : "Decompression"} Analysis
          </h5>
          <p className="text-sm text-blue-800">{result.performanceExplanation}</p>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-sm font-medium text-green-800">
              File {result.action}ed successfully using {result.algorithm.toUpperCase()}
              {result.action === "compress" && ` - Achieved ${getCompressionRatio()}% size reduction`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
