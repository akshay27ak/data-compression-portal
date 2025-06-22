module.exports = {
  compress(buffer) {
    // Dummy compression (replace with real Huffman logic)
    return { buffer: Buffer.from(buffer.toString('base64')), explanation: "Huffman simulated." };
  },
  decompress(buffer) {
    return Buffer.from(buffer.toString(), 'base64');
  }
};
