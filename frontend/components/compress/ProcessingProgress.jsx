"use client"

export default function ProcessingProgress({ progress }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Processing Progress</span>
        <span className="text-sm font-semibold text-blue-600">{progress}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>Analyzing file...</span>
        <span>Applying compression...</span>
      </div>
    </div>
  )
}
