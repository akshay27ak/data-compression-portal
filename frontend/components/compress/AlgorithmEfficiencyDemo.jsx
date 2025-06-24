"use client"

export default function AlgorithmEfficiencyDemo({ fileType, originalSize }) {
  const getAlgorithmEfficiency = (algorithm, fileType, size) => {
    const efficiencyMap = {
      huffman: {
        text: { ratio: 45, speed: 2.1, explanation: "Excellent for text due to character frequency analysis" },
        image: { ratio: 15, speed: 1.8, explanation: "Limited effectiveness on image data with uniform distribution" },
        binary: { ratio: 25, speed: 2.3, explanation: "Moderate compression on structured binary data" },
      },
      rle: {
        text: { ratio: 20, speed: 0.8, explanation: "Poor for text with few repeated character sequences" },
        image: { ratio: 65, speed: 0.5, explanation: "Excellent for images with large uniform color areas" },
        binary: { ratio: 35, speed: 0.6, explanation: "Good for binary data with repetitive patterns" },
      },
      lz77: {
        text: { ratio: 55, speed: 3.2, explanation: "Very effective for text with repeated phrases and patterns" },
        image: { ratio: 40, speed: 2.8, explanation: "Good compression by finding repeated pixel patterns" },
        binary: { ratio: 50, speed: 3.0, explanation: "Excellent general-purpose compression for binary files" },
      },
      jpeg: {
        text: { ratio: 10, speed: 1.5, explanation: "Not suitable for text - designed for photographic images" },
        image: { ratio: 85, speed: 1.2, explanation: "Excellent for photos - optimized for human visual perception" },
        binary: { ratio: 5, speed: 1.8, explanation: "Not recommended for binary data - may cause corruption" },
      },
    }

    return (
      efficiencyMap[algorithm]?.[fileType] || { ratio: 30, speed: 2.0, explanation: "Standard compression performance" }
    )
  }

  const algorithms = ["huffman", "rle", "lz77", "jpeg"]
  const fileTypeDisplay = fileType || "binary"

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          Algorithm Efficiency Comparison
        </h3>
        <p className="text-gray-600 text-sm">
          Expected performance for {fileTypeDisplay} files ({(originalSize / 1024).toFixed(1)} KB)
        </p>
      </div>

      <div className="space-y-4">
        {algorithms.map((algorithm) => {
          const efficiency = getAlgorithmEfficiency(algorithm, fileTypeDisplay, originalSize)
          const compressedSize = originalSize * (1 - efficiency.ratio / 100)
          const isRecommended =
            (fileTypeDisplay === "text" && algorithm === "huffman") ||
            (fileTypeDisplay === "image" && algorithm === "jpeg") ||
            (fileTypeDisplay === "binary" && algorithm === "lz77")

          return (
            <div
              key={algorithm}
              className={`border rounded-lg p-4 ${isRecommended ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {algorithm === "jpeg" ? "JPEG" : algorithm} {algorithm === "jpeg" ? "Compression" : "Coding"}
                  </h4>
                  {isRecommended && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      efficiency.ratio >= 70
                        ? "bg-green-100 text-green-800"
                        : efficiency.ratio >= 30
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {efficiency.ratio}% compression
                  </span>
                  {algorithm === "jpeg" && (
                    <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Lossy</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Original</p>
                  <p className="font-semibold text-gray-900">{(originalSize / 1024).toFixed(1)} KB</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Compressed</p>
                  <p className="font-semibold text-green-600">{(compressedSize / 1024).toFixed(1)} KB</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Est. Speed</p>
                  <p className="font-semibold text-blue-600">{efficiency.speed}s</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Compression Progress</span>
                  <span>{efficiency.ratio}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      efficiency.ratio >= 70 ? "bg-green-500" : efficiency.ratio >= 30 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(efficiency.ratio, 100)}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-xs text-gray-600 italic">{efficiency.explanation}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">💡 Recommendation</h5>
        <p className="text-sm text-blue-800">
          For {fileTypeDisplay} files,{" "}
          <strong>
            {algorithms.reduce((best, current) =>
              getAlgorithmEfficiency(current, fileTypeDisplay, originalSize).ratio >
              getAlgorithmEfficiency(best, fileTypeDisplay, originalSize).ratio
                ? current
                : best,
            )}
          </strong>{" "}
          typically provides the best compression ratio.
          {fileTypeDisplay === "image" && (
            <span className="block mt-1 text-xs">
              Note: JPEG is lossy compression - some image quality will be lost for smaller file sizes.
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
