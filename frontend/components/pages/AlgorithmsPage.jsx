"use client"

import { useState } from "react"
import AlgorithmCard from "../algorithms/AlgorithmCard"
import AlgorithmDetail from "../algorithms/AlgorithmDetail"
import { algorithms } from "../../data/algorithmsData"

export default function AlgorithmsPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null)

  if (selectedAlgorithm) {
    return <AlgorithmDetail algorithm={selectedAlgorithm} onBack={() => setSelectedAlgorithm(null)} />
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Compression Algorithms</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore different compression algorithms, their characteristics, and find the best one for your specific use
          case. Click on any algorithm to learn more details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {algorithms.map((algorithm, index) => (
          <AlgorithmCard key={index} algorithm={algorithm} onClick={() => setSelectedAlgorithm(algorithm)} />
        ))}
      </div>
    </div>
  )
}
