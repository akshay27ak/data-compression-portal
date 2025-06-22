const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Upload failed")
  }

  return response.json()
}

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
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Compression failed")
  }

  return response.json()
}

export const decompressFile = async (fileId, algorithm) => {
  const response = await fetch(`${API_BASE_URL}/decompress`, {
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
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Decompression failed")
  }

  return response.json()
}

export const downloadFile = async (fileId, fileName) => {
  const response = await fetch(`${API_BASE_URL}/download/${fileId}`)

  if (!response.ok) {
    throw new Error("Download failed")
  }

  const blob = await response.blob()

  // Create download link
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName || "processed_file"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return blob
}

export const getFileInfo = async (fileId) => {
  const response = await fetch(`${API_BASE_URL}/file/${fileId}`)

  if (!response.ok) {
    throw new Error("Failed to get file info")
  }

  return response.json()
}
