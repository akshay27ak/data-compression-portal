export const algorithms = [
  {
    id: "huffman",
    name: "Huffman Coding",
    type: "lossless",
    description:
      "A lossless data compression algorithm that uses variable-length codes based on character frequency analysis.",
    efficiency: "High",
    bestFor: "Text files, source code, structured data",
    compressionRatio: "40-60%",
    speed: "Medium",
    memoryUsage: "Medium",
    detailedDescription: `Huffman Coding is a fundamental compression algorithm that assigns variable-length codes to characters based on their frequency of occurrence. Characters that appear more frequently get shorter codes, while less frequent characters get longer codes.

The algorithm works by:
1. **Frequency Analysis**: Count the frequency of each character in the input
2. **Tree Construction**: Build a binary tree where frequent characters are closer to the root
3. **Code Assignment**: Assign binary codes based on the path from root to each character
4. **Encoding**: Replace each character with its corresponding code

This creates an optimal prefix-free code that minimizes the average code length. The algorithm is mathematically proven to be optimal for single-symbol encoding when character probabilities are known.`,
    technicalDetails: {
      algorithm: "Greedy algorithm using priority queue",
      treeStructure: "Binary tree with characters at leaves",
      codeType: "Variable-length prefix-free codes",
      optimalProperty: "Minimizes expected code length",
      complexity: "O(n log n) for construction",
    },
    pros: [
      "Mathematically optimal for single-symbol encoding",
      "Simple to understand and implement",
      "No loss of information (lossless)",
      "Adapts to input character distribution",
      "Foundation for many other compression algorithms",
      "Works well with text and structured data",
    ],
    cons: [
      "Requires two passes (frequency analysis + encoding)",
      "Code table must be stored with compressed data",
      "Not effective for uniform character distribution",
      "Limited to single-character analysis",
      "Overhead of storing the Huffman tree",
    ],
    useCases: [
      "Text file compression",
      "Source code compression",
      "Part of JPEG image compression",
      "Part of ZIP file compression (DEFLATE)",
      "Network protocol compression",
      "Database compression systems",
    ],
  },
  {
    id: "rle",
    name: "Run-Length Encoding",
    type: "lossless",
    description: "Simple compression that replaces sequences of identical data with a count and the data value.",
    efficiency: "Medium",
    bestFor: "Images with uniform areas, simple graphics",
    compressionRatio: "30-70%",
    speed: "Very Fast",
    memoryUsage: "Very Low",
    detailedDescription: `Run-Length Encoding (RLE) is one of the simplest compression algorithms. It works by replacing consecutive identical data elements with a count followed by the data element itself.

For example:
- Input: "AAABBBCCCCCC"
- Output: "3A3B6C"

The algorithm scans through the data sequentially and whenever it finds a sequence of identical elements, it replaces them with:
- **Count**: Number of consecutive identical elements
- **Value**: The repeated element

RLE is particularly effective when data contains many consecutive repeated elements, such as simple graphics with large solid color areas, binary images, or certain types of scientific data. It's often used as a preprocessing step in more complex compression schemes.`,
    technicalDetails: {
      algorithm: "Sequential scan with counting",
      encoding: "Count + Value pairs",
      variants: "Byte-oriented, bit-oriented, enhanced RLE",
      complexity: "O(n) time, O(1) space",
      reversibility: "Perfect reconstruction possible",
    },
    pros: [
      "Extremely simple to implement",
      "Very fast compression and decompression",
      "Minimal memory requirements",
      "Perfect for data with long runs of identical values",
      "Real-time processing capability",
      "No complex data structures needed",
    ],
    cons: [
      "Can increase file size for random data",
      "Limited effectiveness on complex data patterns",
      "No adaptation to varying data characteristics",
      "Vulnerable to worst-case expansion",
      "Not suitable for general-purpose compression",
    ],
    useCases: [
      "Bitmap image compression (BMP RLE)",
      "Fax transmission compression",
      "Simple graphics and icons",
      "Screen capture compression",
      "Preprocessing for other compression algorithms",
      "Scientific data with repetitive patterns",
    ],
  },
  {
    id: "lz77",
    name: "LZ77",
    type: "lossless",
    description:
      "Dictionary-based compression that replaces repeated data with references to earlier occurrences in the data stream.",
    efficiency: "High",
    bestFor: "General purpose files, text documents",
    compressionRatio: "50-70%",
    speed: "Medium",
    memoryUsage: "Medium",
    detailedDescription: `LZ77 is a dictionary-based compression algorithm that maintains a sliding window of recently processed data. When the algorithm encounters a sequence that has appeared before within the window, it replaces the sequence with a reference to the earlier occurrence.

The algorithm uses a triple format for references:
- **Distance**: How far back in the buffer the match is located
- **Length**: How long the matching sequence is  
- **Next Character**: The character immediately following the match

The sliding window consists of two parts:
1. **Search Buffer**: Contains recently processed data that can be referenced
2. **Look-ahead Buffer**: Contains data yet to be processed

This approach is particularly effective for data with repeated patterns and forms the foundation for many modern compression formats including GZIP, PNG, and ZIP files.`,
    technicalDetails: {
      algorithm: "Sliding window with longest match search",
      windowSize: "Typically 4KB to 64KB",
      encoding: "(distance, length, next_char) triples",
      searchMethod: "Hash tables or binary search trees",
      variants: "LZ77, LZSS, LZ78, LZW",
    },
    pros: [
      "Excellent compression for repetitive data",
      "Adapts to local data patterns automatically",
      "No need to store dictionary separately",
      "Foundation for many modern compression algorithms",
      "Good balance of speed and compression ratio",
      "Works well with various data types",
    ],
    cons: [
      "Slower than simple algorithms like RLE",
      "Memory usage depends on window size",
      "Complex implementation compared to basic methods",
      "Performance varies significantly with data characteristics",
      "Requires careful tuning of window parameters",
    ],
    useCases: [
      "GZIP and ZIP file compression",
      "PNG image compression",
      "GIF image compression (LZW variant)",
      "Network protocol compression",
      "Database compression systems",
      "General-purpose file archiving",
    ],
  },
]

export const getAlgorithmById = (id) => {
  return algorithms.find((algo) => algo.id === id)
}

export const getAlgorithmsByType = (type) => {
  return algorithms.filter((algo) => algo.type === type)
}

export const getLosslessAlgorithms = () => {
  return getAlgorithmsByType("lossless")
}

export const getAlgorithmNames = () => {
  return algorithms.map((algo) => ({ id: algo.id, name: algo.name }))
}
