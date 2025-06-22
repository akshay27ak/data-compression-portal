"use client"

export default function FileTypeDetection({ file, detectedType }) {
  const getTypeInfo = (type) => {
    switch (type) {
      case "text":
        return {
          label: "Text File",
          icon: "📄",
          color: "blue",
          description: "Contains readable text content",
        }
      case "image":
        return {
          label: "Image File",
          icon: "🖼️",
          color: "green",
          description: "Visual content like photos or graphics",
        }
      case "binary":
        return {
          label: "Binary File",
          icon: "⚙️",
          color: "purple",
          description: "Executable or structured binary data",
        }
      default:
        return {
          label: "Unknown",
          icon: "❓",
          color: "gray",
          description: "File type could not be determined",
        }
    }
  }

  const typeInfo = getTypeInfo(detectedType)
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    gray: "bg-gray-50 border-gray-200 text-gray-800",
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">🔍</span>
          File Type Detection
        </h3>
        <p className="text-gray-600 text-sm">Automatically detected file characteristics</p>
      </div>

      <div className={`border rounded-lg p-4 ${colorClasses[typeInfo.color]}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{typeInfo.icon}</span>
          <div>
            <p className="font-semibold">{typeInfo.label}</p>
            <p className="text-sm opacity-80">{typeInfo.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-600 font-medium">MIME Type</p>
          <p className="text-gray-900 font-mono text-xs">{file.type || "application/octet-stream"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-600 font-medium">File Extension</p>
          <p className="text-gray-900 font-mono text-xs">{file.name.split(".").pop()?.toUpperCase() || "N/A"}</p>
        </div>
      </div>
    </div>
  )
}
