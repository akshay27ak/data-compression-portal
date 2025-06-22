"use client"

import { useState } from "react"
import Header from "./Header"
import TabNavigation from "./TabNavigation"
import CompressPage from "./pages/CompressPage"
import AlgorithmsPage from "./pages/AlgorithmsPage"
// import MetricsPage from "./pages/MetricsPage"

export default function App() {
  const [activeTab, setActiveTab] = useState("compress")

  const renderActiveTab = () => {
    switch (activeTab) {
      case "compress":
        return <CompressPage />
      case "algorithms":
        return <AlgorithmsPage />
      // case "metrics":
      //   return <MetricsPage />
      default:
        return <CompressPage />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-8">{renderActiveTab()}</div>
      </div>
    </div>
  )
}
