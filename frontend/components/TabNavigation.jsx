"use client"

export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: "compress",
      name: "Compress",
      icon: "⚡",
    },
    {
      id: "algorithms",
      name: "Algorithms",
      icon: "📋",
    },
    {
      id: "metrics",
      name: "Metrics",
      icon: "📊",
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <nav className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium text-sm transition-all duration-200
              ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.name}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
