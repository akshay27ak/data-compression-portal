function compress(inputBuffer) {
  const input = inputBuffer.toString('binary');
  let output = '';

  for (let i = 0; i < input.length;) {
    let count = 1;
    while (i + count < input.length && input[i] === input[i + count] && count < 255) {
      count++;
    }
    output += String.fromCharCode(count) + input[i];
    i += count;
  }

  return {
    buffer: Buffer.from(output, 'binary'),
    explanation: 'RLE replaces runs of characters with (count, char) pairs.'
  };
}

function decompress(compressedBuffer) {
  const input = compressedBuffer.toString('binary');
  let output = '';

  for (let i = 0; i < input.length; i += 2) {
    const count = input.charCodeAt(i);
    const char = input[i + 1];
    output += char.repeat(count);
  }

  return Buffer.from(output, 'binary');
}

module.exports = { compress, decompress };
