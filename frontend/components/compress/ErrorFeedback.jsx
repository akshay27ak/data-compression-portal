"use client"

import { useState, useEffect } from "react"

export default function ErrorFeedback({ error, onClose }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) 
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [error, onClose])

  if (!error) return null

  return (
    <div
      className={`
      fixed top-4 right-4 z-50 max-w-md transition-all duration-300 transform
      ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
    `}
    >
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-red-500 text-xl">❌</span>
          <div className="flex-1">
            <h4 className="font-semibold text-red-800 mb-1">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
