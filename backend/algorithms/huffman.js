// algorithms/huffman.js

class HuffNode {
  constructor(char, freq, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

function buildTree(freqMap) {
  let nodes = Object.entries(freqMap).map(
    ([char, freq]) => new HuffNode(char, freq)
  );

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    const parent = new HuffNode(null, left.freq + right.freq, left, right);
    nodes.push(parent);
  }

  return nodes[0];
}

function buildCodes(node, prefix = "", map = {}) {
  if (!node) return;
  if (node.char !== null) map[node.char] = prefix;
  buildCodes(node.left, prefix + "0", map);
  buildCodes(node.right, prefix + "1", map);
  return map;
}

function bitsToBuffer(bitString) {
  const extra = (8 - (bitString.length % 8)) % 8;
  bitString += "0".repeat(extra);
  const bytes = [];
  for (let i = 0; i < bitString.length; i += 8) {
    bytes.push(parseInt(bitString.substr(i, 8), 2));
  }
  return { buffer: Buffer.from(bytes), extra };
}

function bufferToBits(buffer, extra) {
  let bitString = "";
  for (const byte of buffer) {
    bitString += byte.toString(2).padStart(8, "0");
  }
  return bitString.slice(0, bitString.length - extra);
}

module.exports = {
  compress(buffer) {
    const data = buffer.toString("binary");
    const freqMap = {};
    for (const ch of data) {
      freqMap[ch] = (freqMap[ch] || 0) + 1;
    }
    const root = buildTree(freqMap);
    const codes = buildCodes(root);

    let bitString = "";
    for (const ch of data) {
      bitString += codes[ch];
    }

    const { buffer: compressedBuf, extra } = bitsToBuffer(bitString);
    const codeMapBuffer = Buffer.from(JSON.stringify(codes));
    const codeMapLengthBuffer = Buffer.alloc(4);
    codeMapLengthBuffer.writeUInt32BE(codeMapBuffer.length, 0);

    return {
      buffer: Buffer.concat([
        codeMapLengthBuffer,
        codeMapBuffer,
        Buffer.from([extra]),
        compressedBuf,
      ]),
      explanation: "Huffman coding with encoded header and bitstream.",
    };
  },

  decompress(buffer) {
    const codeMapLength = buffer.readUInt32BE(0);
    const codeMapBuffer = buffer.slice(4, 4 + codeMapLength);
    const codes = JSON.parse(codeMapBuffer.toString());

    const extra = buffer[4 + codeMapLength];
    const dataBuf = buffer.slice(4 + codeMapLength + 1);

    const bits = bufferToBits(dataBuf, extra);

    const rev = {};
    for (const [ch, code] of Object.entries(codes)) {
      rev[code] = ch;
    }

    let current = "", result = "";
    for (const bit of bits) {
      current += bit;
      if (rev[current]) {
        result += rev[current];
        current = "";
      }
    }

    return Buffer.from(result, "binary");
  },
};
