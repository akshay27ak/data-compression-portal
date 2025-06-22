/**
 * Run-Length Encoding (RLE) Implementation
 * Simple and efficient compression for data with repeated sequences
 */

async function compress(data) {
  try {
    if (data.length === 0) {
      return Buffer.from([])
    }

    const compressed = []
    let i = 0

    while (i < data.length) {
      const currentByte = data[i]
      let count = 1

      // Count consecutive identical bytes
      while (i + count < data.length && data[i + count] === currentByte && count < 255) {
        count++
      }

      // Store count and byte value
      compressed.push(count)
      compressed.push(currentByte)

      i += count
    }

    return Buffer.from(compressed)
  } catch (error) {
    throw new Error(`RLE compression failed: ${error.message}`)
  }
}

async function decompress(compressedData) {
  try {
    if (compressedData.length === 0) {
      return Buffer.from([])
    }

    if (compressedData.length % 2 !== 0) {
      throw new Error("Invalid RLE compressed data: odd length")
    }

    const decompressed = []

    for (let i = 0; i < compressedData.length; i += 2) {
      const count = compressedData[i]
      const value = compressedData[i + 1]

      // Repeat the value 'count' times
      for (let j = 0; j < count; j++) {
        decompressed.push(value)
      }
    }

    return Buffer.from(decompressed)
  } catch (error) {
    throw new Error(`RLE decompression failed: ${error.message}`)
  }
}

module.exports = {
  compress,
  decompress,
  name: "Run-Length Encoding",
}
