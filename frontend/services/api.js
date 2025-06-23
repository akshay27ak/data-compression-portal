const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://data-compression-portal-production.up.railway.app" || "http://localhost:5000"

// Upload file
export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Upload failed")
  }

  return response.json()
}

// Compress file
export const compressFile = async (fileId, algorithm) => {
  const response = await fetch(`${API_BASE_URL}/compress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileId,
      algorithm,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Compression failed")
  }

  return response.json()
}

// Decompress file - FIX: Make sure this calls the correct endpoint
export const decompressFile = async (fileId, algorithm) => {
  const response = await fetch(`${API_BASE_URL}/compress/decompress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileId,
      algorithm,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Decompression failed")
  }

  return response.json()
}

// Download file
export const downloadFile = async (fileId, fileName) => {
  const response = await fetch(`${API_BASE_URL}/download/${fileId}`)

  if (!response.ok) {
    throw new Error("Download failed")
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.style.display = "none"
  a.href = url
  a.download = fileName || "download"
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// Get file info
export const getFileInfo = async (fileId) => {
  const response = await fetch(`${API_BASE_URL}/file/${fileId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to get file info")
  }

  return response.json()
}
