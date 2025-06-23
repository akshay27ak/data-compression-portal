"use client"

import { useState } from "react"
import FileUpload from "../compress/FileUpload"
import FileTypeDetection from "../compress/FileTypeDetection"
import AlgorithmSelection from "../compress/AlgorithmSelection"
import ActionButtons from "../compress/ActionButtons"
import CompressionResult from "../compress/CompressionResult"
import DownloadSection from "../compress/DownloadSection"
import ErrorFeedback from "../compress/ErrorFeedback"
import AlgorithmEfficiencyDemo from "../compress/AlgorithmEfficiencyDemo"
import { uploadFile, compressFile, decompressFile } from "../../services/api"

export default function CompressPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadedFileId, setUploadedFileId] = useState(null)
  const [detectedFileType, setDetectedFileType] = useState(null)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("huffman")
  const [autoSuggest, setAutoSuggest] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingAction, setProcessingAction] = useState("")
  const [compressionResult, setCompressionResult] = useState(null)
  const [error, setError] = useState("")
  const [downloadReady, setDownloadReady] = useState(false)
  const [fileStatus, setFileStatus] = useState({ isCompressed: false, detectedAlgorithm: null })

  const handleFileSelect = async (file) => {
    // Reset all states when new file is selected
    setSelectedFile(file)
    setCompressionResult(null)
    setDownloadReady(false)
    setError("")
    setUploadedFileId(null)
    setDetectedFileType(null)
    setFileStatus({ isCompressed: false, detectedAlgorithm: null })

    if (!file) {
      setSelectedAlgorithm("huffman")
      return
    }

    // Upload file to backend for processing and detection
    try {
      setIsProcessing(true)
      setProcessingAction("upload")

      console.log("🔄 Uploading file:", file.name)
      const uploadResult = await uploadFile(file)
      console.log("✅ Upload result:", uploadResult)

      setUploadedFileId(uploadResult.fileId || uploadResult.id)

      // Set file status from backend response
      const status = {
        isCompressed: uploadResult.isCompressed || false,
        detectedAlgorithm: uploadResult.detectedAlgorithm,
        compressionType: uploadResult.compressionType,
      }
      setFileStatus(status)

      console.log("📊 File status:", status)

      // Handle algorithm selection based on file status
      if (status.isCompressed) {
        // For compressed files, set the detected algorithm
        setSelectedAlgorithm(status.detectedAlgorithm)
        setDetectedFileType("compressed")
        console.log(`🗜️ Compressed file detected: ${status.detectedAlgorithm}`)
      } else {
        // For original files, detect type and suggest algorithm
        const fileType = detectFileType(file)
        setDetectedFileType(fileType)

        if (autoSuggest) {
          const suggestedAlgorithm = suggestAlgorithm(fileType)
          setSelectedAlgorithm(suggestedAlgorithm)
        }
        console.log(`📄 Original file detected: ${fileType}`)
      }
    } catch (err) {
      console.error("❌ Upload error:", err)
      setError(`Upload failed: ${err.message}`)
    } finally {
      setIsProcessing(false)
      setProcessingAction("")
    }
  }

  const detectFileType = (file) => {
    if (file.type.startsWith("text/")) return "text"
    if (file.type.startsWith("image/")) return "image"
    return "binary"
  }

  const suggestAlgorithm = (fileType) => {
    switch (fileType) {
      case "text":
        return "huffman"
      case "image":
        return "jpeg"
      case "binary":
        return "lz77"
      default:
        return "huffman"
    }
  }

  const handleAutoSuggestChange = (enabled) => {
    setAutoSuggest(enabled)

    // Only auto-suggest for non-compressed files
    if (enabled && detectedFileType && !fileStatus.isCompressed) {
      const suggestedAlgorithm = suggestAlgorithm(detectedFileType)
      setSelectedAlgorithm(suggestedAlgorithm)
    }
  }

  const handleCompress = async () => {
    if (!selectedFile || !uploadedFileId) {
      setError("Please upload a file first")
      return
    }

    if (fileStatus.isCompressed) {
      setError("This file is already compressed. Use decompress instead.")
      return
    }

    setIsProcessing(true)
    setProcessingAction("compress")
    setError("")

    try {
      console.log(`🗜️ Starting compression: ${selectedAlgorithm} on file ${uploadedFileId}`)
      const result = await compressFile(uploadedFileId, selectedAlgorithm)
      console.log("✅ Compression result:", result)

      const formattedResult = {
        action: "compress",
        originalSize: result.originalSize || selectedFile.size,
        processedSize: result.compressedSize || result.processedSize,
        algorithm: selectedAlgorithm,
        algorithmType: selectedAlgorithm === "jpeg" ? "Lossy" : "Lossless",
        timeTaken: result.processingTime || result.timeTaken,
        performanceExplanation:
          result.explanation || getPerformanceExplanation(selectedAlgorithm, detectedFileType, result),
        fileId: result.fileId || result.id,
        compressionRatio: result.compressionRatio,
      }

      setCompressionResult(formattedResult)
      setDownloadReady(true)
    } catch (err) {
      console.error("❌ Compression error:", err)
      setError(`Compression failed: ${err.message}`)
    } finally {
      setIsProcessing(false)
      setProcessingAction("")
    }
  }

  const handleDecompress = async () => {
    if (!selectedFile || !uploadedFileId) {
      setError("Please upload a file first")
      return
    }

    if (!fileStatus.isCompressed) {
      setError("This file is not compressed. Use compress instead.")
      return
    }

    setIsProcessing(true)
    setProcessingAction("decompress")
    setError("")

    try {
      console.log(`📦 Starting decompression: ${selectedAlgorithm} on file ${uploadedFileId}`)
      console.log("🔍 File status:", fileStatus)

      const result = await decompressFile(uploadedFileId, selectedAlgorithm)
      console.log("✅ Decompression result:", result)

      const formattedResult = {
        action: "decompress",
        originalSize: result.originalSize || selectedFile.size,
        processedSize: result.decompressedSize || result.processedSize,
        algorithm: selectedAlgorithm,
        algorithmType: selectedAlgorithm === "jpeg" ? "Lossy to Lossless" : "Lossless",
        timeTaken: result.processingTime || result.timeTaken,
        performanceExplanation:
          result.explanation || `Successfully decompressed your file using ${selectedAlgorithm} algorithm.`,
        fileId: result.fileId || result.id,
      }

      setCompressionResult(formattedResult)
      setDownloadReady(true)
    } catch (err) {
      console.error("❌ Decompression error:", err)
      setError(`Decompression failed: ${err.message}`)
    } finally {
      setIsProcessing(false)
      setProcessingAction("")
    }
  }

  const getPerformanceExplanation = (algorithm, fileType, result) => {
    const ratio = result.compressionRatio || ((result.originalSize - result.processedSize) / result.originalSize) * 100
    return `${algorithm} achieved ${ratio.toFixed(1)}% compression on your ${fileType} file.`
  }

  return (
    <div className="space-y-8">
      <ErrorFeedback error={error} onClose={() => setError("")} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} fileStatus={fileStatus} />

          {selectedFile && (
            <FileTypeDetection file={selectedFile} detectedType={detectedFileType} compressionStatus={fileStatus} />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AlgorithmSelection
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={setSelectedAlgorithm}
            autoSuggest={autoSuggest && !fileStatus.isCompressed}
            onAutoSuggestChange={handleAutoSuggestChange}
            detectedFileType={detectedFileType}
          />

          <ActionButtons
            onCompress={handleCompress}
            onDecompress={handleDecompress}
            isProcessing={isProcessing}
            processingAction={processingAction}
            disabled={!selectedFile || !uploadedFileId}
            selectedAlgorithm={selectedAlgorithm}
            fileStatus={fileStatus}
          />
        </div>
      </div>

      {/* Algorithm Efficiency Demo - Only show for original files */}
      {selectedFile && !compressionResult && !fileStatus.isCompressed && (
        <AlgorithmEfficiencyDemo fileType={detectedFileType} originalSize={selectedFile.size} />
      )}

      {/* Results Section */}
      {compressionResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CompressionResult result={compressionResult} />

          {downloadReady && (
            <DownloadSection
              result={compressionResult}
              fileName={selectedFile?.name}
              fileId={compressionResult.fileId}
            />
          )}
        </div>
      )}
    </div>
  )
}
