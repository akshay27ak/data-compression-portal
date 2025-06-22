/**
 * JPEG Compression Implementation
 * Using Sharp library for high-quality image processing
 */

const sharp = require("sharp")
const Jimp = require("jimp")

async function compress(data) {
  try {
    if (data.length === 0) {
      return Buffer.from([])
    }

    // Check if data is an image by trying to process it
    const isImage = await isImageData(data)

    if (isImage) {
      // Use Sharp for high-quality JPEG compression
      return await compressImage(data)
    } else {
      // For non-image data, apply a lossy compression simulation
      return applyLossyCompression(data)
    }
  } catch (error) {
    throw new Error(`JPEG compression failed: ${error.message}`)
  }
}

async function decompress(compressedData) {
  try {
    if (compressedData.length === 0) {
      return Buffer.from([])
    }

    // Check if this is a JPEG image
    if (compressedData[0] === 0xff && compressedData[1] === 0xd8) {
      // This is a JPEG image - convert to raw image data
      return await decompressJpegImage(compressedData)
    } else {
      // This is our custom lossy compressed data
      return decompressLossyData(compressedData)
    }
  } catch (error) {
    throw new Error(`JPEG decompression failed: ${error.message}`)
  }
}

async function isImageData(data) {
  try {
    // Try to get image metadata using Sharp
    await sharp(data).metadata()
    return true
  } catch (error) {
    // If Sharp can't process it, it's not a valid image
    return false
  }
}

async function compressImage(data) {
  try {
    // Use Sharp to compress as JPEG with quality 80
    const compressedBuffer = await sharp(data)
      .jpeg({
        quality: 80,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer()

    return compressedBuffer
  } catch (error) {
    // Fallback to Jimp if Sharp fails
    try {
      const image = await Jimp.read(data)
      const buffer = await image.quality(80).getBufferAsync(Jimp.MIME_JPEG)
      return buffer
    } catch (jimpError) {
      throw new Error(`Image compression failed: ${error.message}`)
    }
  }
}

async function decompressJpegImage(jpegData) {
  try {
    // Convert JPEG back to raw image data (PNG format for lossless storage)
    const rawImageBuffer = await sharp(jpegData).png().toBuffer()

    // Add metadata header to indicate this is decompressed image data
    const header = Buffer.from("DECOMP_IMG", "utf8")
    const lengthBuffer = Buffer.alloc(4)
    lengthBuffer.writeUInt32BE(rawImageBuffer.length, 0)

    return Buffer.concat([header, lengthBuffer, rawImageBuffer])
  } catch (error) {
    throw new Error(`JPEG image decompression failed: ${error.message}`)
  }
}

function applyLossyCompression(data) {
  // Simple lossy compression for non-image data
  const compressed = []

  // Add header to indicate lossy compression
  compressed.push(0x4c, 0x4f, 0x53, 0x53) // "LOSS" in ASCII

  // Store original length
  const originalLength = data.length
  compressed.push((originalLength >> 24) & 0xff)
  compressed.push((originalLength >> 16) & 0xff)
  compressed.push((originalLength >> 8) & 0xff)
  compressed.push(originalLength & 0xff)

  // Apply lossy compression by sampling and quantizing
  const sampleRate = 2 // Keep every 2nd byte
  for (let i = 0; i < data.length; i += sampleRate) {
    // Quantize the byte (reduce precision)
    const quantized = Math.floor(data[i] / 4) * 4
    compressed.push(quantized)
  }

  return Buffer.from(compressed)
}

function decompressLossyData(compressedData) {
  // Skip header (4 bytes)
  let offset = 4

  // Read original length
  const originalLength =
    (compressedData[offset] << 24) |
    (compressedData[offset + 1] << 16) |
    (compressedData[offset + 2] << 8) |
    compressedData[offset + 3]
  offset += 4

  // Decompress by interpolating missing data
  const decompressed = []
  const compressedBytes = compressedData.slice(offset)
  const sampleRate = 2

  for (let i = 0; i < compressedBytes.length; i++) {
    decompressed.push(compressedBytes[i])

    // Interpolate missing byte (simple approximation)
    if (decompressed.length < originalLength) {
      const nextValue = i + 1 < compressedBytes.length ? compressedBytes[i + 1] : compressedBytes[i]
      const interpolated = Math.floor((compressedBytes[i] + nextValue) / 2)
      decompressed.push(interpolated)
    }
  }

  // Trim to original length
  return Buffer.from(decompressed.slice(0, originalLength))
}

module.exports = {
  compress,
  decompress,
  name: "JPEG Compression",
}
