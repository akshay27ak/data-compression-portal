"use client"

import { useState } from "react"
import { algorithms } from "../../data/algorithmsData"

export default function AlgorithmSelector({ selectedAlgorithm, onAlgorithmChange }) {
  const [isOpen, setIsOpen] = useState(false)

  // Default to huffman if no selection or invalid selection
  const currentAlgorithm = selectedAlgorithm || "huffman"
  const selectedAlgo = algorithms.find((algo) => algo.id === currentAlgorithm)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-900 text-white">
              {selectedAlgo?.type}
            </span>
            <div>
              <span className="font-medium text-gray-900">{selectedAlgo?.name}</span>
              <p className="text-xs text-gray-500">{selectedAlgo?.description.substring(0, 50)}...</p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {algorithms.map((algorithm) => (
              <button
                key={algorithm.id}
                onClick={() => {
                  onAlgorithmChange(algorithm.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg transition-colors duration-150 ${
                  currentAlgorithm === algorithm.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                }`}
              >
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-900 text-white">
                  {algorithm.type}
                </span>
                <div>
                  <span className="font-medium text-gray-900">{algorithm.name}</span>
                  <p className="text-xs text-gray-500">{algorithm.description.substring(0, 40)}...</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
