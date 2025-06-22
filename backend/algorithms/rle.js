// algorithms/rle.js

module.exports = {
  compress(buffer) {
    const input = buffer.toString('binary'); // Read as binary
    let compressed = '';
    let count = 1;

    for (let i = 1; i <= input.length; i++) {
      if (input[i] === input[i - 1] && count < 255) {
        count++;
      } else {
        compressed += String.fromCharCode(count) + input[i - 1];
        count = 1;
      }
    }

    return {
      buffer: Buffer.from(compressed, 'binary'),
      explanation: "Run-Length Encoding (RLE) works by replacing sequences of repeated bytes with a count followed by the byte itself. Best for repetitive data."
    };
  },

  decompress(buffer) {
    const input = buffer.toString('binary');
    let output = '';

    for (let i = 0; i < input.length; i += 2) {
      const count = input.charCodeAt(i);
      const char = input[i + 1];
      output += char.repeat(count);
    }

    return Buffer.from(output, 'binary');
  }
};
