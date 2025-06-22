"use client"

import { useState } from "react"
import AlgorithmSelector from "./AlgorithmSelector"
import CompressionButton from "./CompressionButton"
import ProcessingProgress from "./ProcessingProgress"

export default function CompressionSettings() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("huffman")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [compressionType, setCompressionType] = useState("lossless")

  const handleCompress = async () => {
    setIsProcessing(true)
    setProgress(0)

    // Simulate compression process with progress updates
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    setTimeout(() => {
      setIsProcessing(false)
      setProgress(0)
      alert(`File compressed successfully using ${selectedAlgorithm.toUpperCase()}!`)
    }, 500)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <span className="text-2xl">⚙️</span>
          Compression Settings
        </h2>
        <p className="text-gray-600">Choose algorithm and configure parameters</p>
      </div>

      <div className="space-y-6">
        <AlgorithmSelector selectedAlgorithm={selectedAlgorithm} onAlgorithmChange={setSelectedAlgorithm} />

        {/* Compression Type - All three algorithms are lossless */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Compression Type</label>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm font-medium text-green-800">Lossless Compression</span>
            </div>
            <p className="text-xs text-green-700 mt-1">All selected algorithms preserve original data perfectly</p>
          </div>
        </div>

        {/* Algorithm-specific settings */}
        {selectedAlgorithm === "huffman" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Huffman Coding Settings</h4>
            <p className="text-sm text-blue-800">
              Optimal for text files and structured data with varying character frequencies.
            </p>
          </div>
        )}

        {selectedAlgorithm === "rle" && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Run-Length Encoding Settings</h4>
            <p className="text-sm text-purple-800">
              Best for data with many consecutive repeated elements like simple graphics.
            </p>
          </div>
        )}

        {selectedAlgorithm === "lz77" && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-2">LZ77 Settings</h4>
            <p className="text-sm text-orange-800">Excellent for general-purpose compression with repeated patterns.</p>
          </div>
        )}

        {isProcessing && <ProcessingProgress progress={progress} />}

        <CompressionButton onCompress={handleCompress} isProcessing={isProcessing} />
      </div>
    </div>
  )
}
