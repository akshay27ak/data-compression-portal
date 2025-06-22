"use client"

export default function AlgorithmCard({ algorithm, onClick }) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 p-6 cursor-pointer"
      onClick={() => onClick && onClick(algorithm)}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{algorithm.name}</h3>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            algorithm.type === "lossless" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
          }`}
        >
          {algorithm.type.toUpperCase()}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-6 leading-relaxed">{algorithm.description}</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 font-medium mb-1">EFFICIENCY</p>
            <p className="text-sm font-bold text-blue-800">{algorithm.efficiency}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-purple-600 font-medium mb-1">SPEED</p>
            <p className="text-sm font-bold text-purple-800">{algorithm.speed}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 font-medium mb-1">BEST FOR</p>
          <p className="text-sm font-semibold text-gray-800">{algorithm.bestFor}</p>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">Compression Ratio</p>
            <p className="text-lg font-bold text-green-600">{algorithm.compressionRatio}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Memory Usage</p>
            <p className="text-sm font-semibold text-gray-700">{algorithm.memoryUsage}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors">
          <span className="text-sm font-medium">Learn More</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
