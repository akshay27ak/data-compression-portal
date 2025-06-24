const WINDOW_SIZE = 4096 // Search buffer size
const LOOKAHEAD_SIZE = 18 // Look-ahead buffer size
const MIN_MATCH_LENGTH = 3 // Minimum match length to encode

async function compress(data) {
  try {
    if (data.length === 0) {
      return Buffer.from([])
    }

    const compressed = []
    let position = 0

    const lengthBuffer = Buffer.alloc(4)
    lengthBuffer.writeUInt32BE(data.length, 0)
    compressed.push(...lengthBuffer)

    while (position < data.length) {
      const match = findLongestMatch(data, position)

      if (match.length >= MIN_MATCH_LENGTH) {
        const nextChar = position + match.length < data.length ? data[position + match.length] : 0

        compressed.push(0xff) // Flag for match
        compressed.push((match.distance >> 8) & 0xff) // Distance high byte
        compressed.push(match.distance & 0xff) // Distance low byte
        compressed.push(match.length) // Length
        compressed.push(nextChar) // Next character

        position += match.length + (nextChar !== 0 ? 1 : 0)
      } else {
        const literal = data[position]
        if (literal === 0xff) {
          compressed.push(0xfe) 
          compressed.push(0xff) 
        } else {
          compressed.push(literal)
        }
        position++
      }
    }

    return Buffer.from(compressed)
  } catch (error) {
    throw new Error(`LZ77 compression failed: ${error.message}`)
  }
}

async function decompress(compressedData) {
  try {
    if (compressedData.length === 0) {
      return Buffer.from([])
    }

    const originalLength = compressedData.readUInt32BE(0)
    const decompressed = []
    let i = 4 

    while (i < compressedData.length && decompressed.length < originalLength) {
      if (compressedData[i] === 0xff && i + 4 < compressedData.length) {
        i++
        const distance = (compressedData[i] << 8) | compressedData[i + 1]
        const length = compressedData[i + 2]
        const nextChar = compressedData[i + 3]
        i += 4

        const startPos = decompressed.length - distance
        for (let j = 0; j < length && decompressed.length < originalLength; j++) {
          if (startPos + j >= 0 && startPos + j < decompressed.length) {
            decompressed.push(decompressed[startPos + j])
          } else {
            break
          }
        }

        if (nextChar !== 0 && decompressed.length < originalLength) {
          decompressed.push(nextChar)
        }
      } else if (compressedData[i] === 0xfe && i + 1 < compressedData.length) {
        i++ 
        decompressed.push(compressedData[i])
        i++
      } else {
        decompressed.push(compressedData[i])
        i++
      }
    }

    return Buffer.from(decompressed.slice(0, originalLength))
  } catch (error) {
    throw new Error(`LZ77 decompression failed: ${error.message}`)
  }
}

function findLongestMatch(data, position) {
  let bestMatch = { distance: 0, length: 0 }

  const searchStart = Math.max(0, position - WINDOW_SIZE)
  const lookaheadEnd = Math.min(data.length, position + LOOKAHEAD_SIZE)

  for (let i = searchStart; i < position; i++) {
    let matchLength = 0

    while (
      position + matchLength < lookaheadEnd &&
      i + matchLength < position &&
      data[i + matchLength] === data[position + matchLength]
    ) {
      matchLength++
    }

    if (matchLength > bestMatch.length) {
      bestMatch = {
        distance: position - i,
        length: matchLength,
      }
    }
  }

  return bestMatch
}

module.exports = {
  compress,
  decompress,
  name: "LZ77",
}
