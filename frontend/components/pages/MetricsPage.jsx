export default function MetricsPage() {
  return (
    <div className="text-center py-16">
      <div className="max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📊</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Metrics Dashboard</h2>
        <p className="text-lg text-gray-600 mb-8">
          This section will display comprehensive compression statistics, performance metrics, and detailed analytics
          about your file processing activities including compression ratios, processing times, and algorithm
          comparisons.
        </p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon Features:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-700">Real-time compression analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-700">Algorithm performance comparison</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-gray-700">File processing history</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span className="text-gray-700">Storage savings calculator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
