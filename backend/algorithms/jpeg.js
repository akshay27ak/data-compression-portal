const sharp = require("sharp")
const Jimp = require("jimp")

async function compress(data) {
  try {
    if (data.length === 0) {
      return Buffer.from([])
    }

    const isImage = await isImageData(data)

    if (isImage) {
      return await compressImage(data)
    } else {
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

    if (compressedData[0] === 0xff && compressedData[1] === 0xd8) {
      return await decompressJpegImage(compressedData)
    } else if (
      compressedData[0] === 0x4c &&
      compressedData[1] === 0x4f &&
      compressedData[2] === 0x53 &&
      compressedData[3] === 0x53
    ) {
      return decompressLossyData(compressedData)
    } else {
      throw new Error("Invalid JPEG compressed data format")
    }
  } catch (error) {
    throw new Error(`JPEG decompression failed: ${error.message}`)
  }
}

async function isImageData(data) {
  try {
    await sharp(data).metadata()
    return true
  } catch (error) {
    return false
  }
}

async function compressImage(data) {
  try {
    const compressedBuffer = await sharp(data)
      .jpeg({
        quality: 80,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer()

    return compressedBuffer
  } catch (error) {
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
    const pngBuffer = await sharp(jpegData).png().toBuffer()
    return pngBuffer
  } catch (error) {
    try {
      const image = await Jimp.read(jpegData)
      const buffer = await image.getBufferAsync(Jimp.MIME_PNG)
      return buffer
    } catch (jimpError) {
      throw new Error(`JPEG image decompression failed: ${error.message}`)
    }
  }
}

function applyLossyCompression(data) {
  const compressed = []

  compressed.push(0x4c, 0x4f, 0x53, 0x53)

  const originalLength = data.length
  compressed.push((originalLength >> 24) & 0xff)
  compressed.push((originalLength >> 16) & 0xff)
  compressed.push((originalLength >> 8) & 0xff)
  compressed.push(originalLength & 0xff)

  const sampleRate = 2 
  for (let i = 0; i < data.length; i += sampleRate) {
    const quantized = Math.floor(data[i] / 4) * 4
    compressed.push(quantized)
  }

  return Buffer.from(compressed)
}

function decompressLossyData(compressedData) {
  let offset = 4

  const originalLength =
    (compressedData[offset] << 24) |
    (compressedData[offset + 1] << 16) |
    (compressedData[offset + 2] << 8) |
    compressedData[offset + 3]
  offset += 4

  const decompressed = []
  const compressedBytes = compressedData.slice(offset)
  const sampleRate = 2

  for (let i = 0; i < compressedBytes.length; i++) {
    decompressed.push(compressedBytes[i])

    if (decompressed.length < originalLength) {
      const nextValue = i + 1 < compressedBytes.length ? compressedBytes[i + 1] : compressedBytes[i]
      const interpolated = Math.floor((compressedBytes[i] + nextValue) / 2)
      decompressed.push(interpolated)
    }
  }

  return Buffer.from(decompressed.slice(0, originalLength))
}

module.exports = {
  compress,
  decompress,
  name: "JPEG Compression",
}
