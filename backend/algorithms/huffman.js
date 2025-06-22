/**
 * Huffman Coding Implementation - FIXED DECOMPRESSION
 * Research-based implementation using frequency analysis and binary tree construction
 */

class HuffmanNode {
  constructor(char, freq, left = null, right = null) {
    this.char = char
    this.freq = freq
    this.left = left
    this.right = right
  }

  isLeaf() {
    return this.left === null && this.right === null
  }
}

class MinHeap {
  constructor() {
    this.heap = []
  }

  parent(i) {
    return Math.floor((i - 1) / 2)
  }
  leftChild(i) {
    return 2 * i + 1
  }
  rightChild(i) {
    return 2 * i + 2
  }

  swap(i, j) {
    ;[this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]
  }

  insert(node) {
    this.heap.push(node)
    this.heapifyUp(this.heap.length - 1)
  }

  heapifyUp(i) {
    while (i > 0 && this.heap[this.parent(i)].freq > this.heap[i].freq) {
      this.swap(i, this.parent(i))
      i = this.parent(i)
    }
  }

  extractMin() {
    if (this.heap.length === 0) return null
    if (this.heap.length === 1) return this.heap.pop()

    const min = this.heap[0]
    this.heap[0] = this.heap.pop()
    this.heapifyDown(0)
    return min
  }

  heapifyDown(i) {
    let minIndex = i
    const left = this.leftChild(i)
    const right = this.rightChild(i)

    if (left < this.heap.length && this.heap[left].freq < this.heap[minIndex].freq) {
      minIndex = left
    }
    if (right < this.heap.length && this.heap[right].freq < this.heap[minIndex].freq) {
      minIndex = right
    }

    if (minIndex !== i) {
      this.swap(i, minIndex)
      this.heapifyDown(minIndex)
    }
  }

  size() {
    return this.heap.length
  }
}

function buildFrequencyTable(data) {
  const freq = {}
  for (let i = 0; i < data.length; i++) {
    const byte = data[i]
    freq[byte] = (freq[byte] || 0) + 1
  }
  return freq
}

function buildHuffmanTree(frequencies) {
  const heap = new MinHeap()

  // Create leaf nodes for each character
  for (const [char, freq] of Object.entries(frequencies)) {
    heap.insert(new HuffmanNode(Number.parseInt(char), freq))
  }

  // Handle single character case
  if (heap.size() === 1) {
    const node = heap.extractMin()
    return new HuffmanNode(null, node.freq, node, null)
  }

  // Build tree bottom-up
  while (heap.size() > 1) {
    const left = heap.extractMin()
    const right = heap.extractMin()
    const merged = new HuffmanNode(null, left.freq + right.freq, left, right)
    heap.insert(merged)
  }

  return heap.extractMin()
}

function generateCodes(root) {
  const codes = {}

  function traverse(node, code) {
    if (node.isLeaf()) {
      codes[node.char] = code || "0" // Handle single character case
      return
    }
    if (node.left) traverse(node.left, code + "0")
    if (node.right) traverse(node.right, code + "1")
  }

  traverse(root, "")
  return codes
}

function serializeTree(node) {
  if (!node) return ""
  if (node.isLeaf()) {
    // Use a safe encoding for the character
    return "1" + node.char.toString().padStart(3, "0")
  }
  return "0" + serializeTree(node.left) + serializeTree(node.right)
}

function deserializeTree(data, index = { value: 0 }) {
  if (index.value >= data.length) return null

  if (data[index.value] === "1") {
    index.value++
    // Read the 3-digit character code
    const charStr = data.substr(index.value, 3)
    const char = Number.parseInt(charStr, 10)
    index.value += 3
    return new HuffmanNode(char, 0)
  } else {
    index.value++
    const left = deserializeTree(data, index)
    const right = deserializeTree(data, index)
    return new HuffmanNode(null, 0, left, right)
  }
}

async function compress(data) {
  try {
    if (data.length === 0) {
      return Buffer.from([])
    }

    // Build frequency table
    const frequencies = buildFrequencyTable(data)

    // Build Huffman tree
    const root = buildHuffmanTree(frequencies)

    // Generate codes
    const codes = generateCodes(root)

    // Serialize tree for storage
    const serializedTree = serializeTree(root)

    // Encode data
    let encodedBits = ""
    for (let i = 0; i < data.length; i++) {
      encodedBits += codes[data[i]]
    }

    // Convert bits to bytes
    const padding = 8 - (encodedBits.length % 8)
    if (padding !== 8) {
      encodedBits += "0".repeat(padding)
    }

    const encodedBytes = []
    for (let i = 0; i < encodedBits.length; i += 8) {
      const byte = Number.parseInt(encodedBits.substr(i, 8), 2)
      encodedBytes.push(byte)
    }

    // Create compressed data format:
    // [original_length(4 bytes)][tree_length(4 bytes)][tree_data][padding(1 byte)][encoded_data]
    const originalLengthBuffer = Buffer.alloc(4)
    originalLengthBuffer.writeUInt32BE(data.length, 0)

    const treeBuffer = Buffer.from(serializedTree, "utf8")
    const treeLengthBuffer = Buffer.alloc(4)
    treeLengthBuffer.writeUInt32BE(treeBuffer.length, 0)

    const paddingBuffer = Buffer.from([padding === 8 ? 0 : padding])
    const encodedBuffer = Buffer.from(encodedBytes)

    return Buffer.concat([originalLengthBuffer, treeLengthBuffer, treeBuffer, paddingBuffer, encodedBuffer])
  } catch (error) {
    throw new Error(`Huffman compression failed: ${error.message}`)
  }
}

async function decompress(compressedData) {
  try {
    if (compressedData.length === 0) {
      return Buffer.from([])
    }

    let offset = 0

    // Read original length
    const originalLength = compressedData.readUInt32BE(offset)
    offset += 4

    // Read tree length
    const treeLength = compressedData.readUInt32BE(offset)
    offset += 4

    // Read serialized tree
    const serializedTree = compressedData.slice(offset, offset + treeLength).toString("utf8")
    offset += treeLength

    // Read padding
    const padding = compressedData[offset]
    offset += 1

    // Read encoded data
    const encodedData = compressedData.slice(offset)

    // Deserialize tree
    const root = deserializeTree(serializedTree)

    // Convert bytes back to bits
    let bits = ""
    for (let i = 0; i < encodedData.length; i++) {
      bits += encodedData[i].toString(2).padStart(8, "0")
    }

    // Remove padding
    if (padding > 0) {
      bits = bits.slice(0, -padding)
    }

    // Decode using tree
    const decoded = []
    let current = root

    for (let i = 0; i < bits.length && decoded.length < originalLength; i++) {
      if (current.isLeaf()) {
        decoded.push(current.char)
        current = root
        i-- // Re-process this bit with the new current node
        continue
      }

      if (bits[i] === "0") {
        current = current.left
      } else {
        current = current.right
      }
    }

    // Handle last character if needed
    if (current && current.isLeaf() && decoded.length < originalLength) {
      decoded.push(current.char)
    }

    return Buffer.from(decoded)
  } catch (error) {
    throw new Error(`Huffman decompression failed: ${error.message}`)
  }
}

module.exports = {
  compress,
  decompress,
  name: "Huffman Coding",
}
