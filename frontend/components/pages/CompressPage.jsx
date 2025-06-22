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

  const handleFileSelect = async (file) => {
    setSelectedFile(file)
    setCompressionResult(null)
    setDownloadReady(false)
    setError("")
    setUploadedFileId(null)

    if (!file) return

    // Detect file type
    const fileType = detectFileType(file)
    setDetectedFileType(fileType)

    // Auto-suggest algorithm if enabled
    if (autoSuggest) {
      const suggestedAlgorithm = suggestAlgorithm(fileType)
      setSelectedAlgorithm(suggestedAlgorithm)
    }

    // Upload file to backend
    try {
      setIsProcessing(true)
      setProcessingAction("upload")

      const uploadResult = await uploadFile(file)
      setUploadedFileId(uploadResult.fileId || uploadResult.id)
    } catch (err) {
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
        return "rle"
      case "binary":
        return "lz77"
      default:
        return "huffman"
    }
  }

  const handleCompress = async () => {
    if (!selectedFile || !uploadedFileId) {
      setError("Please upload a file first")
      return
    }

    setIsProcessing(true)
    setProcessingAction("compress")
    setError("")

    try {
      const result = await compressFile(uploadedFileId, selectedAlgorithm)

      // Format result for display
      const formattedResult = {
        action: "compress",
        originalSize: result.originalSize || selectedFile.size,
        processedSize: result.compressedSize || result.processedSize,
        algorithm: selectedAlgorithm,
        algorithmType: "Lossless",
        timeTaken: result.processingTime || result.timeTaken,
        performanceExplanation:
          result.explanation || getPerformanceExplanation(selectedAlgorithm, detectedFileType, result),
        fileId: result.fileId || result.id,
        compressionRatio: result.compressionRatio,
      }

      setCompressionResult(formattedResult)
      setDownloadReady(true)
    } catch (err) {
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

    setIsProcessing(true)
    setProcessingAction("decompress")
    setError("")

    try {
      const result = await decompressFile(uploadedFileId, selectedAlgorithm)

      // Format result for display
      const formattedResult = {
        action: "decompress",
        originalSize: result.originalSize || selectedFile.size,
        processedSize: result.decompressedSize || result.processedSize,
        algorithm: selectedAlgorithm,
        algorithmType: "Lossless",
        timeTaken: result.processingTime || result.timeTaken,
        performanceExplanation:
          result.explanation ||
          `Successfully decompressed your file using ${selectedAlgorithm} algorithm. The original data has been perfectly restored with no quality loss.`,
        fileId: result.fileId || result.id,
      }

      setCompressionResult(formattedResult)
      setDownloadReady(true)
    } catch (err) {
      setError(`Decompression failed: ${err.message}`)
    } finally {
      setIsProcessing(false)
      setProcessingAction("")
    }
  }

  const getPerformanceExplanation = (algorithm, fileType, result) => {
    const ratio = result.compressionRatio || ((result.originalSize - result.processedSize) / result.originalSize) * 100

    const explanations = {
      huffman: {
        text: `Huffman coding achieved ${ratio.toFixed(1)}% compression by analyzing character frequencies in your text file. Common characters were assigned shorter codes, making this algorithm highly effective for text data.`,
        image: `Huffman coding achieved ${ratio.toFixed(1)}% compression on your image. While not optimal for images due to uniform pixel distribution, it still provided some compression by encoding frequent color values with shorter codes.`,
        binary: `Huffman coding achieved ${ratio.toFixed(1)}% compression on your binary file by creating variable-length codes based on byte frequency patterns found in the data structure.`,
      },
      rle: {
        text: `Run-Length Encoding achieved ${ratio.toFixed(1)}% compression on your text file. This algorithm works best with repeated characters, so the compression ratio depends on how many consecutive identical characters your text contains.`,
        image: `Run-Length Encoding achieved ${ratio.toFixed(1)}% compression by efficiently encoding consecutive pixels of the same color. This algorithm excels with images containing large uniform areas.`,
        binary: `Run-Length Encoding achieved ${ratio.toFixed(1)}% compression by replacing sequences of identical bytes with count-value pairs. The effectiveness depends on repetitive patterns in your binary data.`,
      },
      lz77: {
        text: `LZ77 achieved ${ratio.toFixed(1)}% compression by finding and referencing repeated phrases and words in your text. This dictionary-based approach is excellent for text with recurring patterns.`,
        image: `LZ77 achieved ${ratio.toFixed(1)}% compression by identifying repeated pixel patterns and replacing them with references to earlier occurrences. This works well for images with recurring visual elements.`,
        binary: `LZ77 achieved ${ratio.toFixed(1)}% compression using its sliding window approach to find repeated byte sequences in your binary file. This general-purpose algorithm adapts well to various data patterns.`,
      },
    }

    return explanations[algorithm]?.[fileType] || `${algorithm} achieved ${ratio.toFixed(1)}% compression on your file.`
  }

  return (
    <div className="space-y-8">
      <ErrorFeedback error={error} onClose={() => setError("")} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />

          {selectedFile && <FileTypeDetection file={selectedFile} detectedType={detectedFileType} />}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AlgorithmSelection
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={setSelectedAlgorithm}
            autoSuggest={autoSuggest}
            onAutoSuggestChange={setAutoSuggest}
            detectedFileType={detectedFileType}
          />

          <ActionButtons
            onCompress={handleCompress}
            onDecompress={handleDecompress}
            isProcessing={isProcessing}
            processingAction={processingAction}
            disabled={!selectedFile || !uploadedFileId}
          />
        </div>
      </div>

      {/* Algorithm Efficiency Demo - Shows after file upload */}
      {selectedFile && !compressionResult && (
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
