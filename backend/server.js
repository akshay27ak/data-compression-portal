const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const { readFile, writeFile, getFileSize, ensureDirExists } = require("./utils/fileManager");

const huffman = require("./algorithms/huffman");
const rle = require("./algorithms/rle");
const lz77 = require("./algorithms/lz77");

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

ensureDirExists("uploads");
ensureDirExists("processed");

const upload = multer({ dest: "uploads/" });

const processedFiles = {}; // In-memory store

// Upload
app.post("/upload", upload.single("file"), (req, res) => {
  const id = uuidv4();
  const filePath = req.file.path;
  const originalSize = getFileSize(filePath);
  const fileName = req.file.originalname;

  processedFiles[id] = { id, filePath, fileName, originalSize };

  res.json({ fileId: id, originalSize, fileName });
});

// Compress
app.post('/compress', async (req, res) => {
  try {
    const { fileId, algorithm } = req.body;
    const fileData = processedFiles[fileId];
    if (!fileData) return res.status(404).json({ message: 'File not found.' });

    const inputBuffer = fs.readFileSync(fileData.filePath);
    const start = Date.now();

    const compressors = { rle, huffman, lz77 };
    const compressor = compressors[algorithm];
    if (!compressor) return res.status(400).json({ message: 'Unsupported algorithm' });

    const result = compressor.compress(inputBuffer);
    const end = Date.now();

    const compressedFileId = `compressed-${Date.now()}-${fileId}`;
    const outputPath = path.join(__dirname, 'processed', compressedFileId);
    fs.writeFileSync(outputPath, result.buffer);

    processedFiles[compressedFileId] = {
      id: compressedFileId,
      filePath: outputPath,
      fileName: fileData.fileName,
      originalSize: inputBuffer.length,
      compressedSize: result.buffer.length
    };

    return res.json({
      fileId: compressedFileId,
      originalSize: inputBuffer.length,
      compressedSize: result.buffer.length,
      processingTime: ((end - start) / 1000).toFixed(3),
      compressionRatio: Number(((1 - result.buffer.length / inputBuffer.length) * 100).toFixed(2)),
      explanation: result.explanation
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Compression failed: ' + err.message });
  }
});


// Decompress
app.post("/decompress", (req, res) => {
  try {
    const { fileId, algorithm } = req.body;
    const fileData = processedFiles[fileId];
    if (!fileData) throw new Error("File not found");

    const actualAlgorithm = fileData.algorithm || algorithm;
    const decompressor = { huffman, rle, lz77 }[actualAlgorithm];
    if (!decompressor) throw new Error("Invalid algorithm");

    const start = process.hrtime();
    const inputBuffer = readFile(fileData.filePath);
    const decompressedBuffer = decompressor.decompress(inputBuffer);

    const newId = uuidv4();
    const outputFileName = `DECOMP_${newId}_${fileData.fileName}`;
    const outPath = path.join("processed", outputFileName);
    writeFile(outPath, decompressedBuffer);

    const elapsed = process.hrtime(start);
    const processingTime = (elapsed[0] + elapsed[1] / 1e9).toFixed(3);

    processedFiles[newId] = {
      id: newId,
      filePath: outPath,
      fileName: outputFileName,
      decompressedSize: decompressedBuffer.length
    };

    res.json({
      fileId: newId,
      originalSize: inputBuffer.length,
      decompressedSize: decompressedBuffer.length,
      processingTime,
      explanation: `Decompressed using ${actualAlgorithm}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Decompression failed: " + err.message });
  }
});

// Download
app.get("/download/:fileId", (req, res) => {
  const fileData = processedFiles[req.params.fileId];
  if (!fileData) return res.status(404).json({ message: "File not found" });
  res.download(fileData.filePath, fileData.fileName);
});

// Start Server
app.listen(5000, () => {
  console.log("✅ Backend running at http://localhost:5000");
});
