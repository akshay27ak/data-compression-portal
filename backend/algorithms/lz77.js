/**
 * LZ77 Implementation
 * Dictionary-based compression using sliding window technique
 */

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

    while (position < data.length) {
      const match = findLongestMatch(data, position)

      if (match.length >= MIN_MATCH_LENGTH) {
        // Encode as (distance, length, next_char)
        const nextChar = position + match.length < data.length ? data[position + match.length] : 0

        // Use a flag byte to indicate this is a match
        compressed.push(0xff) // Flag for match
        compressed.push((match.distance >> 8) & 0xff) // Distance high byte
        compressed.push(match.distance & 0xff) // Distance low byte
        compressed.push(match.length) // Length
        compressed.push(nextChar) // Next character

        position += match.length + 1
      } else {
        // Encode as literal
        compressed.push(data[position])
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

    const decompressed = []
    let i = 0

    while (i < compressedData.length) {
      if (compressedData[i] === 0xff && i + 4 < compressedData.length) {
        // This is a match
        i++ // Skip flag
        const distance = (compressedData[i] << 8) | compressedData[i + 1]
        const length = compressedData[i + 2]
        const nextChar = compressedData[i + 3]
        i += 4

        // Copy from the sliding window
        const startPos = decompressed.length - distance
        for (let j = 0; j < length; j++) {
          if (startPos + j >= 0 && startPos + j < decompressed.length) {
            decompressed.push(decompressed[startPos + j])
          }
        }

        // Add the next character
        if (nextChar !== 0) {
          decompressed.push(nextChar)
        }
      } else {
        // This is a literal
        decompressed.push(compressedData[i])
        i++
      }
    }

    return Buffer.from(decompressed)
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

    // Find how long the match is
    while (
      position + matchLength < lookaheadEnd &&
      i + matchLength < position &&
      data[i + matchLength] === data[position + matchLength]
    ) {
      matchLength++
    }

    // Update best match if this one is longer
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
