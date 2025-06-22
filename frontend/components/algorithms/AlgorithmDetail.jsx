"use client"

export default function AlgorithmDetail({ algorithm, onBack }) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back to Algorithms</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{algorithm.name}</h1>
            <p className="text-xl text-gray-600">{algorithm.description}</p>
          </div>
          <span
            className={`px-4 py-2 text-sm font-semibold rounded-full ${
              algorithm.type === "lossless" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
            }`}
          >
            {algorithm.type.toUpperCase()}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-600 font-medium mb-1">EFFICIENCY</p>
            <p className="text-lg font-bold text-blue-800">{algorithm.efficiency}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-xs text-purple-600 font-medium mb-1">SPEED</p>
            <p className="text-lg font-bold text-purple-800">{algorithm.speed}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-xs text-green-600 font-medium mb-1">COMPRESSION</p>
            <p className="text-lg font-bold text-green-800">{algorithm.compressionRatio}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-xs text-orange-600 font-medium mb-1">MEMORY</p>
            <p className="text-lg font-bold text-orange-800">{algorithm.memoryUsage}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
            <div className="prose prose-gray max-w-none">
              {algorithm.detailedDescription.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(algorithm.technicalDetails).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </p>
                  <p className="text-sm text-gray-900 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {algorithm.useCases.map((useCase, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-800">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Advantages
            </h3>
            <ul className="space-y-2">
              {algorithm.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-red-500">✗</span>
              Limitations
            </h3>
            <ul className="space-y-2">
              {algorithm.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Best For */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Best For</h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-800">{algorithm.bestFor}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
